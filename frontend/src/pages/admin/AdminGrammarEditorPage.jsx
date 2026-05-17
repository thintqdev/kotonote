import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import GrammarLocFields from '../../components/admin/GrammarLocFields.jsx';
import {
	GRAMMAR_JLPT_LEVELS,
	GRAMMAR_TAG_IDS,
} from '../../constants/grammarFieldMeta.js';
import {
	createAdminGrammar,
	getAdminGrammar,
	updateAdminGrammar,
} from '../../services/adminGrammarService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import {
	emptyGrammarForm,
	formToGrammarPayload,
	grammarToForm,
} from '../../utils/grammarForm.js';
import './AdminGrammarPage.css';

export default function AdminGrammarEditorPage() {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const navigate = useNavigate();
	const [form, setForm] = useState(emptyGrammarForm);
	const [loading, setLoading] = useState(isEdit);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!isEdit) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const g = await getAdminGrammar(id);
				if (!cancelled) setForm(grammarToForm(g));
			} catch (e) {
				toast.error('Không tải được bài ngữ pháp', {
					description: getApiErrorMessage(e),
				});
				navigate('/admin/grammar', { replace: true });
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

	const toggleTag = (tid) => {
		setForm((prev) => {
			const has = prev.tagIds.includes(tid);
			return {
				...prev,
				tagIds: has
					? prev.tagIds.filter((t) => t !== tid)
					: [...prev.tagIds, tid],
			};
		});
	};

	const updateExample = (index, value) => {
		setForm((prev) => {
			const next = [...prev.examples];
			next[index] = value;
			return { ...prev, examples: next };
		});
	};

	const updatePractice = (index, value) => {
		setForm((prev) => {
			const next = [...prev.practiceItems];
			next[index] = value;
			return { ...prev, practiceItems: next };
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const payload = formToGrammarPayload(form);
			if (isEdit) {
				await updateAdminGrammar(id, payload);
				toast.success('Đã cập nhật ngữ pháp');
			} else {
				await createAdminGrammar(payload);
				toast.success('Đã tạo ngữ pháp');
			}
			navigate('/admin/grammar');
		} catch (err) {
			if (err instanceof Error && err.message === 'COMPARE_JSON_INVALID') {
				toast.error('JSON bảng so sánh không hợp lệ');
			} else {
				toast.error('Không lưu được', {
					description: getApiErrorMessage(err),
				});
			}
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
			<Link to="/admin/grammar" className="admin-grammar-back">
				← Danh sách ngữ pháp
			</Link>
			<h1 className="admin-grammar-title">
				{isEdit ? 'Sửa ngữ pháp' : 'Thêm ngữ pháp'}
			</h1>

			<form className="admin-grammar-form" onSubmit={handleSubmit}>
				<section className="admin-grammar-form-section">
					<h2>Thông tin cơ bản</h2>
					<div className="admin-grammar-grid">
						<label>
							Slug
							<input
								value={form.slug}
								onChange={(e) => setField('slug', e.target.value)}
								placeholder="ni-yoru-to"
								required
								disabled={isEdit}
							/>
						</label>
						<label>
							Pattern
							<input
								value={form.pattern}
								onChange={(e) => setField('pattern', e.target.value)}
								required
								lang="ja"
							/>
						</label>
						<label>
							JLPT
							<select
								value={form.jlpt}
								onChange={(e) => setField('jlpt', e.target.value)}
							>
								{GRAMMAR_JLPT_LEVELS.map((lv) => (
									<option key={lv} value={lv}>
										{lv}
									</option>
								))}
							</select>
						</label>
						<label>
							Thứ tự
							<input
								type="number"
								min={0}
								value={form.displayOrder}
								onChange={(e) =>
									setField('displayOrder', Number(e.target.value))
								}
							/>
						</label>
					</div>
					<label className="admin-grammar-check">
						<input
							type="checkbox"
							checked={form.isPublished}
							onChange={(e) => setField('isPublished', e.target.checked)}
						/>
						Xuất bản (hiển thị cho người học)
					</label>
					<div className="admin-grammar-tags-pick">
						<span className="admin-grammar-tags-label">Tags</span>
						{GRAMMAR_TAG_IDS.map((tid) => (
							<label key={tid} className="admin-grammar-tag-check">
								<input
									type="checkbox"
									checked={form.tagIds.includes(tid)}
									onChange={() => toggleTag(tid)}
								/>
								{tid}
							</label>
						))}
					</div>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Teaser & ribbon</h2>
					<GrammarLocFields
						label="Teaser"
						value={form.teaser}
						onChange={(v) => setField('teaser', v)}
					/>
					<GrammarLocFields
						label="Topic ribbon"
						value={form.topicRibbon}
						onChange={(v) => setField('topicRibbon', v)}
						rows={2}
					/>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Nội dung chính</h2>
					<GrammarLocFields
						label="Kết nối"
						value={form.connection}
						onChange={(v) => setField('connection', v)}
					/>
					<GrammarLocFields
						label="Ý nghĩa"
						value={form.meaning}
						onChange={(v) => setField('meaning', v)}
					/>
					<GrammarLocFields
						label="Cách dùng"
						value={form.usage}
						onChange={(v) => setField('usage', v)}
					/>
					<GrammarLocFields
						label="Ghi chú cách dùng"
						value={form.usageNote}
						onChange={(v) => setField('usageNote', v)}
					/>
					<GrammarLocFields
						label="Point bubble"
						value={form.pointBubble}
						onChange={(v) => setField('pointBubble', v)}
					/>
					<GrammarLocFields
						label="Memo"
						value={form.memo}
						onChange={(v) => setField('memo', v)}
					/>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Ví dụ</h2>
					{form.examples.map((ex, idx) => (
						<div key={`ex-${idx}`} className="admin-grammar-repeat">
							<GrammarLocFields
								label={`Ví dụ ${idx + 1}`}
								value={ex}
								onChange={(v) => updateExample(idx, v)}
								rows={2}
							/>
							{form.examples.length > 1 ? (
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--ghost"
									onClick={() =>
										setForm((prev) => ({
											...prev,
											examples: prev.examples.filter((_, i) => i !== idx),
										}))
									}
								>
									Xóa ví dụ
								</button>
							) : null}
						</div>
					))}
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() =>
							setForm((prev) => ({
								...prev,
								examples: [...prev.examples, { ja: '', vi: '' }],
							}))
						}
					>
						+ Thêm ví dụ
					</button>
				</section>

				<section className="admin-grammar-form-section">
					<h2>NG</h2>
					<label>
						NG (JA) — mỗi dòng một mục
						<textarea
							rows={4}
							value={form.ngJaText}
							onChange={(e) => setField('ngJaText', e.target.value)}
							lang="ja"
						/>
					</label>
					<label>
						NG (VI)
						<textarea
							rows={4}
							value={form.ngViText}
							onChange={(e) => setField('ngViText', e.target.value)}
						/>
					</label>
					<GrammarLocFields
						label="Ghi chú NG"
						value={form.ngNote}
						onChange={(v) => setField('ngNote', v)}
					/>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Bảng so sánh (JSON)</h2>
					<textarea
						className="admin-grammar-json"
						rows={10}
						value={form.compareJson}
						onChange={(e) => setField('compareJson', e.target.value)}
					/>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Luyện tập</h2>
					{form.practiceItems.map((it, idx) => (
						<div key={`pr-${idx}`} className="admin-grammar-repeat">
							<GrammarLocFields
								label={`Bài ${idx + 1}`}
								value={it}
								onChange={(v) => updatePractice(idx, v)}
								rows={2}
							/>
						</div>
					))}
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() =>
							setForm((prev) => ({
								...prev,
								practiceItems: [...prev.practiceItems, { ja: '', vi: '' }],
							}))
						}
					>
						+ Thêm dòng luyện tập
					</button>
				</section>

				<div className="admin-grammar-form-actions">
					<Link
						to="/admin/grammar"
						className="admin-grammar-btn admin-grammar-btn--ghost"
					>
						Hủy
					</Link>
					<button
						type="submit"
						className="admin-grammar-btn admin-grammar-btn--primary"
						disabled={saving}
					>
						{saving ? 'Đang lưu…' : 'Lưu'}
					</button>
				</div>
			</form>
		</div>
	);
}
