import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
	createAdminReadingArticle,
	getAdminReadingArticle,
	updateAdminReadingArticle,
	uploadAdminReadingCover,
} from '../../services/adminReadingService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import EditorAIGenerateModal from '../../components/admin/EditorAIGenerateModal.jsx';
import { READING_AI_GENERATE } from '../../constants/editorAiGenerateConfig.js';
import {
	READING_JLPT_LEVELS,
	articleToForm,
	emptyQuestion,
	emptyReadingForm,
	formToArticlePayload,
} from '../../utils/readingForm.js';
import { mergeReadingAIIntoForm } from '../../utils/readingAiMerge.js';
import './AdminGrammarPage.css';

export default function AdminReadingEditorPage() {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const navigate = useNavigate();
	const [form, setForm] = useState(emptyReadingForm);
	const [loading, setLoading] = useState(isEdit);
	const [saving, setSaving] = useState(false);
	const [coverUploading, setCoverUploading] = useState(false);
	const [coverDragOver, setCoverDragOver] = useState(false);
	const [generateOpen, setGenerateOpen] = useState(false);
	const coverFileRef = useRef(null);

	const coverPreviewSrc = resolvePublicMediaUrl(form.imageUrl);

	useEffect(() => {
		if (!isEdit) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const article = await getAdminReadingArticle(id);
				if (!cancelled) setForm(articleToForm(article));
			} catch (e) {
				toast.error('Không tải được bài đọc', {
					description: getApiErrorMessage(e),
				});
				navigate('/admin/reading', { replace: true });
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [id, isEdit, navigate]);

	const setField = (key, value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleCoverFile = useCallback(
		async (file) => {
			if (!file?.type?.startsWith('image/')) {
				toast.error('Chỉ chấp nhận file ảnh');
				return;
			}
			if (file.size > 2 * 1024 * 1024) {
				toast.error('Ảnh tối đa 2MB');
				return;
			}
			setCoverUploading(true);
			try {
				const { imageUrl } = await uploadAdminReadingCover(
					file,
					isEdit ? id : undefined,
				);
				if (imageUrl) {
					setField('imageUrl', imageUrl);
					toast.success('Đã tải ảnh bìa lên');
				}
			} catch (e) {
				toast.error('Không tải được ảnh', {
					description: getApiErrorMessage(e),
				});
			} finally {
				setCoverUploading(false);
			}
		},
		[id, isEdit],
	);

	const onCoverFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) void handleCoverFile(file);
		e.target.value = '';
	};

	const onCoverDrop = (e) => {
		e.preventDefault();
		setCoverDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) void handleCoverFile(file);
	};

	const updateVocab = (index, key, value) => {
		setForm((prev) => {
			const next = [...prev.vocabulary];
			next[index] = { ...next[index], [key]: value };
			return { ...prev, vocabulary: next };
		});
	};

	const updateQuestion = (qi, patch) => {
		setForm((prev) => {
			const next = [...prev.questions];
			next[qi] = { ...next[qi], ...patch };
			return { ...prev, questions: next };
		});
	};

	const updateQuestionChoice = (qi, ci, value) => {
		setForm((prev) => {
			const next = [...prev.questions];
			const choices = [...next[qi].choices];
			choices[ci] = value;
			next[qi] = { ...next[qi], choices };
			return { ...prev, questions: next };
		});
	};

	const updateQuestionExplain = (qi, lang, ci, value) => {
		const key = lang === 'vi' ? 'explainVi' : 'explainJa';
		setForm((prev) => {
			const next = [...prev.questions];
			const arr = [...next[qi][key]];
			arr[ci] = value;
			next[qi] = { ...next[qi], [key]: arr };
			return { ...prev, questions: next };
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const payload = formToArticlePayload(form);
			if (isEdit) {
				await updateAdminReadingArticle(id, payload);
				toast.success('Đã cập nhật bài đọc');
			} else {
				await createAdminReadingArticle(payload);
				toast.success('Đã tạo bài đọc');
			}
			navigate('/admin/reading');
		} catch (err) {
			toast.error('Không lưu được', { description: getApiErrorMessage(err) });
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="admin-stub-main admin-grammar-page">
				<p className="admin-grammar-status">Đang tải…</p>
			</div>
		);
	}

	return (
		<div className="admin-stub-main admin-grammar-page admin-grammar-editor">
			<Link to="/admin/reading" className="admin-grammar-back">
				← Danh sách đọc hiểu
			</Link>
			<div className="admin-grammar-editor-head">
				<h1 className="admin-grammar-title">
					{isEdit ? 'Sửa bài đọc' : 'Thêm bài đọc'}
				</h1>
				<button
					type="button"
					className="admin-grammar-ai-btn"
					onClick={() => setGenerateOpen(true)}
				>
					Generate AI
				</button>
			</div>

			<form className="admin-grammar-form" onSubmit={handleSubmit}>
				<section className="admin-grammar-form-section">
					<h2>Thông tin danh sách</h2>
					<div className="admin-grammar-grid">
						<label>
							Slug (URL)
							<input
								value={form.slug}
								onChange={(e) => setField('slug', e.target.value)}
								placeholder="r-seasons"
								required
								disabled={isEdit}
							/>
						</label>
						<label>
							JLPT
							<select
								value={form.jlpt}
								onChange={(e) => setField('jlpt', e.target.value)}
							>
								{READING_JLPT_LEVELS.map((lv) => (
									<option key={lv} value={lv}>
										{lv}
									</option>
								))}
							</select>
						</label>
						<label>
							Tiêu đề (JA)
							<input
								value={form.titleJa}
								onChange={(e) => setField('titleJa', e.target.value)}
								required
								lang="ja"
							/>
						</label>
						<label>
							Snippet (JA)
							<input
								value={form.snippetJa}
								onChange={(e) => setField('snippetJa', e.target.value)}
								lang="ja"
							/>
						</label>
						<label>
							Số từ
							<input
								type="number"
								min={0}
								value={form.wordCount}
								onChange={(e) => setField('wordCount', e.target.value)}
							/>
						</label>
						<label>
							Phút đọc
							<input
								type="number"
								min={1}
								value={form.readingMinutes}
								onChange={(e) => setField('readingMinutes', e.target.value)}
							/>
						</label>
						<label>
							Đánh giá (0–5)
							<input
								type="number"
								min={0}
								max={5}
								step={0.1}
								value={form.rating}
								onChange={(e) => setField('rating', e.target.value)}
							/>
						</label>
						<label>
							Thứ tự hiển thị
							<input
								type="number"
								min={0}
								value={form.displayOrder}
								onChange={(e) => setField('displayOrder', e.target.value)}
							/>
						</label>
						<div className="admin-reading-cover-field">
							<span className="admin-reading-cover-label">Ảnh bìa</span>
							<p className="admin-reading-cover-hint">
								Tải ảnh từ máy (lưu trên server) hoặc dán URL bên ngoài.
							</p>
							{coverPreviewSrc ? (
								<div className="admin-reading-cover-preview">
									<img src={coverPreviewSrc} alt="" decoding="async" />
								</div>
							) : null}
							<input
								ref={coverFileRef}
								type="file"
								className="admin-reading-file-hidden"
								accept="image/png,image/jpeg,image/webp,image/gif"
								onChange={onCoverFileChange}
								disabled={coverUploading}
							/>
							<button
								type="button"
								className={`admin-reading-cover-upload${coverDragOver ? ' admin-reading-cover-upload--drag' : ''}`}
								disabled={coverUploading}
								onClick={() => coverFileRef.current?.click()}
								onDragOver={(e) => {
									e.preventDefault();
									setCoverDragOver(true);
								}}
								onDragLeave={() => setCoverDragOver(false)}
								onDrop={onCoverDrop}
							>
								{coverUploading
									? 'Đang tải lên…'
									: 'Kéo thả ảnh vào đây hoặc bấm để chọn file'}
							</button>
							<label className="admin-reading-cover-url-label">
								Hoặc dán URL
								<input
									value={form.imageUrl}
									onChange={(e) => setField('imageUrl', e.target.value)}
									placeholder="https://… hoặc /uploads/reading/…"
								/>
							</label>
						</div>
						<label className="admin-grammar-check">
							<input
								type="checkbox"
								checked={form.featured}
								onChange={(e) => setField('featured', e.target.checked)}
							/>
							Gợi ý (featured)
						</label>
						<label className="admin-grammar-check">
							<input
								type="checkbox"
								checked={form.isPublished}
								onChange={(e) => setField('isPublished', e.target.checked)}
							/>
							Xuất bản
						</label>
					</div>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Nội dung bài đọc</h2>
					<label className="admin-reading-field-label">
						<span className="admin-grammar-label">Đoạn văn (JA) — cách nhau bằng dòng trống</span>
						<textarea
							className="admin-grammar-textarea admin-grammar-textarea--reading"
							rows={12}
							value={form.paragraphsText}
							onChange={(e) => setField('paragraphsText', e.target.value)}
							lang="ja"
						/>
					</label>
				</section>

				<section className="admin-grammar-form-section admin-reading-vocab-section">
					<h2>Từ vựng</h2>
					{form.vocabulary.map((row, idx) => (
						<div
							key={`voc-${idx}`}
							className="admin-reading-vocab-block"
						>
							<p className="admin-reading-vocab-heading">Từ {idx + 1}</p>
							<div className="admin-grammar-grid admin-reading-vocab-grid">
								<label className="admin-reading-field-label">
									<span className="admin-grammar-label">Từ (JA)</span>
									<input
										className="admin-grammar-input admin-grammar-input--term"
										value={row.termJa}
										onChange={(e) =>
											updateVocab(idx, 'termJa', e.target.value)
										}
										lang="ja"
										placeholder="例：取り組む"
									/>
								</label>
								<label className="admin-reading-field-label">
									<span className="admin-grammar-label">Nghĩa (VI)</span>
									<input
										className="admin-grammar-input"
										value={row.glossVi}
										onChange={(e) =>
											updateVocab(idx, 'glossVi', e.target.value)
										}
										placeholder="Ví dụ: nỗ lực, cố gắng"
									/>
								</label>
								<label className="admin-reading-field-label">
									<span className="admin-grammar-label">Ghi chú (JA)</span>
									<textarea
										className="admin-grammar-textarea admin-grammar-textarea--compact"
										rows={2}
										value={row.glossJa}
										onChange={(e) =>
											updateVocab(idx, 'glossJa', e.target.value)
										}
										lang="ja"
										placeholder="読み・補足など"
									/>
								</label>
							</div>
						</div>
					))}
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost admin-reading-vocab-add"
						onClick={() =>
							setForm((prev) => ({
								...prev,
								vocabulary: [
									...prev.vocabulary,
									{ termJa: '', glossVi: '', glossJa: '' },
								],
							}))
						}
					>
						+ Từ vựng
					</button>
				</section>

				<section className="admin-grammar-form-section admin-reading-questions-section">
					<h2>Câu hỏi hiểu bài</h2>
					{form.questions.map((q, qi) => (
						<fieldset
							key={`q-${qi}`}
							className="admin-grammar-subblock admin-reading-question-block"
						>
							<legend>Câu {qi + 1}</legend>
							<label className="admin-reading-field-label admin-reading-field-label--full">
								<span className="admin-grammar-label">Câu hỏi (JA)</span>
								<textarea
									className="admin-grammar-textarea admin-grammar-textarea--question"
									rows={3}
									value={q.questionJa}
									onChange={(e) =>
										updateQuestion(qi, { questionJa: e.target.value })
									}
									lang="ja"
									placeholder="例：この文章の主旨として最も適当なものはどれですか。"
								/>
							</label>
							{q.choices.map((choice, ci) => (
								<div
									key={`c-${qi}-${ci}`}
									className="admin-reading-choice-block"
								>
									<p className="admin-reading-choice-heading">
										Lựa chọn {ci + 1}
									</p>
									<div className="admin-grammar-grid admin-reading-choice-grid">
										<label className="admin-reading-field-label">
											<span className="admin-grammar-label">Nội dung (JA)</span>
											<input
												className="admin-grammar-input"
												value={choice}
												onChange={(e) =>
													updateQuestionChoice(qi, ci, e.target.value)
												}
												lang="ja"
											/>
										</label>
										<label className="admin-reading-field-label">
											<span className="admin-grammar-label">Giải thích JA</span>
											<textarea
												className="admin-grammar-textarea admin-grammar-textarea--compact"
												rows={2}
												value={q.explainJa[ci] ?? ''}
												onChange={(e) =>
													updateQuestionExplain(qi, 'ja', ci, e.target.value)
												}
												lang="ja"
											/>
										</label>
										<label className="admin-reading-field-label">
											<span className="admin-grammar-label">Giải thích VI</span>
											<textarea
												className="admin-grammar-textarea admin-grammar-textarea--compact"
												rows={2}
												value={q.explainVi[ci] ?? ''}
												onChange={(e) =>
													updateQuestionExplain(qi, 'vi', ci, e.target.value)
												}
											/>
										</label>
									</div>
								</div>
							))}
							<label className="admin-reading-field-label admin-reading-field-label--answer">
								<span className="admin-grammar-label">
									Đáp án đúng (0 = lựa chọn 1)
								</span>
								<input
									type="number"
									className="admin-grammar-input admin-grammar-input--narrow"
									min={0}
									max={Math.max(0, q.choices.length - 1)}
									value={q.answerIndex}
									onChange={(e) =>
										updateQuestion(qi, {
											answerIndex: Number(e.target.value),
										})
									}
								/>
							</label>
						</fieldset>
					))}
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() =>
							setForm((prev) => ({
								...prev,
								questions: [...prev.questions, emptyQuestion()],
							}))
						}
					>
						+ Câu hỏi
					</button>
				</section>

				<div className="admin-grammar-form-actions">
					<button
						type="submit"
						className="admin-grammar-btn admin-grammar-btn--primary"
						disabled={saving}
					>
						{saving ? 'Đang lưu…' : 'Lưu bài đọc'}
					</button>
				</div>
			</form>

			<EditorAIGenerateModal
				open={generateOpen}
				onClose={() => setGenerateOpen(false)}
				config={READING_AI_GENERATE}
				levelKey={form.jlpt}
				onApply={(ai) =>
					setForm((prev) => ({
						...mergeReadingAIIntoForm(prev, ai),
						jlpt: prev.jlpt,
						slug: prev.slug,
					}))
				}
			/>
		</div>
	);
}
