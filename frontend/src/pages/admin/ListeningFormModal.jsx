import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminListeningService from '../../services/adminListeningService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import {
	LISTENING_JLPT_LEVELS,
	LISTENING_TYPES,
} from '../../constants/listeningFieldMeta.js';
import './AdminGrammarPage.css';
import './AdminListeningPage.css';

const emptyQuestion = () => ({
	questionVi: '',
	questionJa: '',
	choices: ['', '', '', ''],
	choiceImages: ['', '', '', ''],
	answerIndex: 0,
	explainVi: '',
});

export default function ListeningFormModal({ isOpen, onClose, initialData, onSubmit }) {
	const [activeFormTab, setActiveFormTab] = useState('general');
	const [formTitleJa, setFormTitleJa] = useState('');
	const [formTitleVi, setFormTitleVi] = useState('');
	const [formJlpt, setFormJlpt] = useState('N3');
	const [formType, setFormType] = useState('task');
	const [formDuration, setFormDuration] = useState(60);
	const [formAudioUrl, setFormAudioUrl] = useState('');
	const [formImage, setFormImage] = useState('');
	const [formDisplayOrder, setFormDisplayOrder] = useState(1);
	const [formScriptJa, setFormScriptJa] = useState('');
	const [formScriptVi, setFormScriptVi] = useState('');
	const [formIsPublished, setFormIsPublished] = useState(true);
	const [formQuestions, setFormQuestions] = useState([emptyQuestion()]);
	const [uploadingAudio, setUploadingAudio] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [uploadingChoice, setUploadingChoice] = useState(null);

	useEffect(() => {
		if (!isOpen) return;
		if (initialData) {
			setFormTitleJa(initialData.titleJa || '');
			setFormTitleVi(initialData.titleVi || '');
			setFormJlpt(initialData.jlpt || 'N3');
			setFormType(initialData.type || 'task');
			setFormDuration(initialData.duration || 60);
			setFormAudioUrl(initialData.audioUrl || '');
			setFormImage(initialData.image || '');
			setFormDisplayOrder(initialData.displayOrder || 1);
			setFormScriptJa(initialData.scriptJa || '');
			setFormScriptVi(initialData.scriptVi || '');
			setFormIsPublished(initialData.isPublished !== false);
			const mapped = (initialData.questions || []).map((q) => ({
				questionVi: q.questionVi || '',
				questionJa: q.questionJa || '',
				choices:
					q.choices?.length === 4 ? [...q.choices] : ['', '', '', ''],
				choiceImages:
					q.choiceImages?.length === 4
						? [...q.choiceImages]
						: ['', '', '', ''],
				answerIndex: typeof q.answerIndex === 'number' ? q.answerIndex : 0,
				explainVi: q.explainVi || '',
			}));
			setFormQuestions(mapped.length > 0 ? mapped : [emptyQuestion()]);
		} else {
			setFormTitleJa('');
			setFormTitleVi('');
			setFormJlpt('N3');
			setFormType('task');
			setFormDuration(60);
			setFormAudioUrl('');
			setFormImage('');
			setFormDisplayOrder(1);
			setFormScriptJa('');
			setFormScriptVi('');
			setFormIsPublished(true);
			setFormQuestions([emptyQuestion()]);
		}
		setActiveFormTab('general');
	}, [isOpen, initialData]);

	if (!isOpen) return null;

	const handleAudioFileUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 8 * 1024 * 1024) {
			toast.error('File âm thanh tối đa 8MB.');
			return;
		}
		setUploadingAudio(true);
		try {
			const url = await adminListeningService.uploadAudio(file);
			setFormAudioUrl(url);
			toast.success('Đã tải audio lên MinIO');
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setUploadingAudio(false);
			e.target.value = '';
		}
	};

	const handleImageFileUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error('Ảnh minh họa tối đa 2MB.');
			return;
		}
		setUploadingImage(true);
		try {
			const url = await adminListeningService.uploadImage(file);
			setFormImage(url);
			toast.success('Đã tải ảnh lên MinIO');
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setUploadingImage(false);
			e.target.value = '';
		}
	};

	const handleChoiceImageUpload = async (qIndex, cIndex, e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error('Ảnh đáp án tối đa 2MB.');
			return;
		}
		const key = `${qIndex}-${cIndex}`;
		setUploadingChoice(key);
		try {
			const url = await adminListeningService.uploadImage(file);
			const updated = [...formQuestions];
			if (!updated[qIndex].choiceImages) {
				updated[qIndex].choiceImages = ['', '', '', ''];
			}
			updated[qIndex].choiceImages[cIndex] = url;
			setFormQuestions(updated);
			toast.success(`Đã tải ảnh đáp án ${cIndex + 1}`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setUploadingChoice(null);
			e.target.value = '';
		}
	};

	const isBase64Audio = formAudioUrl.trim().startsWith('data:');
	const hasUploadedAudio =
		formAudioUrl &&
		!isBase64Audio &&
		(formAudioUrl.startsWith('http') || formAudioUrl.startsWith('/uploads/'));
	const audioPreviewSrc = hasUploadedAudio
		? resolvePublicMediaUrl(formAudioUrl)
		: null;
	const imagePreviewSrc = resolvePublicMediaUrl(formImage);
	const isUploadingMedia =
		uploadingAudio || uploadingImage || uploadingChoice !== null;

	const handleAddQuestion = () => {
		setFormQuestions((prev) => [...prev, emptyQuestion()]);
	};

	const handleRemoveQuestion = (index) => {
		if (formQuestions.length <= 1) {
			toast.error('Cần ít nhất một câu hỏi.');
			return;
		}
		setFormQuestions((prev) => prev.filter((_, i) => i !== index));
	};

	const handleQuestionChange = (index, field, val) => {
		const updated = [...formQuestions];
		updated[index][field] = val;
		setFormQuestions(updated);
	};

	const handleChoiceChange = (qIndex, cIndex, val) => {
		const updated = [...formQuestions];
		updated[qIndex].choices[cIndex] = val;
		setFormQuestions(updated);
	};

	const handleChoiceImageChange = (qIndex, cIndex, val) => {
		const updated = [...formQuestions];
		if (!updated[qIndex].choiceImages) {
			updated[qIndex].choiceImages = ['', '', '', ''];
		}
		updated[qIndex].choiceImages[cIndex] = val;
		setFormQuestions(updated);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!formTitleVi.trim()) {
			toast.error('Vui lòng điền tiêu đề tiếng Việt.');
			return;
		}
		if (!formAudioUrl.trim()) {
			toast.error('Cần URL audio hoặc link YouTube.');
			return;
		}
		if (isBase64Audio) {
			toast.error('Audio đang ở dạng base64. Tải lại file để lưu lên MinIO.');
			return;
		}
		if (isUploadingMedia) {
			toast.error('Đang tải file, vui lòng đợi.');
			return;
		}
		if (!formScriptJa.trim()) {
			toast.error('Vui lòng điền kịch bản tiếng Nhật.');
			return;
		}
		for (let i = 0; i < formQuestions.length; i++) {
			const q = formQuestions[i];
			const hasText = q.choices.some((c) => c.trim());
			const hasImg = (q.choiceImages || []).some((img) => img?.trim());
			if (!hasText && !hasImg) {
				toast.error(`Câu ${i + 1}: cần ít nhất một đáp án.`);
				return;
			}
		}
		onSubmit({
			titleJa: formTitleJa.trim(),
			titleVi: formTitleVi.trim(),
			jlpt: formJlpt,
			type: formType,
			duration: Number(formDuration) || 60,
			audioUrl: formAudioUrl.trim(),
			image: formImage.trim(),
			scriptJa: formScriptJa.trim(),
			scriptVi: formScriptVi.trim(),
			isPublished: Boolean(formIsPublished),
			displayOrder: Number(formDisplayOrder) || 1,
			questions: formQuestions,
		});
	};

	const tabs = [
		{ id: 'general', label: 'Thông tin chung' },
		{ id: 'script', label: 'Kịch bản' },
		{ id: 'questions', label: 'Câu hỏi' },
	];

	return (
		<div
			className="admin-grammar-modal-backdrop"
			onClick={onClose}
			role="presentation"
		>
			<div
				className="admin-grammar-modal admin-grammar-modal--wide"
				onClick={(ev) => ev.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="listening-modal-title"
			>
				<div className="admin-grammar-modal-header">
					<h2 id="listening-modal-title" className="admin-grammar-modal-title">
						{initialData ? 'Sửa bài luyện nghe' : 'Thêm bài luyện nghe'}
					</h2>
					<button
						type="button"
						className="admin-grammar-modal-close"
						onClick={onClose}
						aria-label="Đóng"
					>
						×
					</button>
				</div>

				<div className="admin-grammar-modal-tabs" role="tablist">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={activeFormTab === tab.id}
							className={`admin-grammar-modal-tab${activeFormTab === tab.id ? ' admin-grammar-modal-tab--active' : ''}`}
							onClick={() => setActiveFormTab(tab.id)}
						>
							{tab.label}
						</button>
					))}
				</div>

				<form onSubmit={handleSubmit}>
					<div className="admin-grammar-modal-body">
						{activeFormTab === 'general' && (
							<div className="admin-grammar-form-stack">
								<div
									className="admin-grammar-row-2"
									style={{ gridTemplateColumns: '1.2fr 1fr' }}
								>
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">
											Tiêu đề tiếng Việt <span className="admin-grammar-req">*</span>
										</label>
										<input
											type="text"
											className="admin-grammar-input"
											value={formTitleVi}
											onChange={(e) => setFormTitleVi(e.target.value)}
											required
										/>
									</div>
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">Tiêu đề tiếng Nhật</label>
										<input
											type="text"
											className="admin-grammar-input"
											value={formTitleJa}
											onChange={(e) => setFormTitleJa(e.target.value)}
											lang="ja"
										/>
									</div>
								</div>

								<div className="admin-grammar-row-3">
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">JLPT</label>
										<select
											className="admin-grammar-select"
											value={formJlpt}
											onChange={(e) => setFormJlpt(e.target.value)}
										>
											{LISTENING_JLPT_LEVELS.map((lv) => (
												<option key={lv} value={lv}>
													{lv}
												</option>
											))}
										</select>
									</div>
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">Dạng bài</label>
										<select
											className="admin-grammar-select"
											value={formType}
											onChange={(e) => setFormType(e.target.value)}
										>
											{LISTENING_TYPES.map((t) => (
												<option key={t.key} value={t.key}>
													{t.labelVi} ({t.labelJa})
												</option>
											))}
										</select>
									</div>
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">Thời lượng (giây)</label>
										<input
											type="number"
											className="admin-grammar-input"
											min={0}
											value={formDuration}
											onChange={(e) => setFormDuration(e.target.value)}
										/>
									</div>
								</div>

								<div className="admin-grammar-field">
									<label className="admin-grammar-label">
										Audio URL <span className="admin-grammar-req">*</span>
									</label>
									<input
										type="text"
										className="admin-grammar-input"
										value={isBase64Audio ? '' : formAudioUrl}
										readOnly={isBase64Audio || uploadingAudio}
										disabled={uploadingAudio}
										onChange={(e) => setFormAudioUrl(e.target.value)}
										placeholder={
											uploadingAudio
												? 'Đang tải lên MinIO…'
												: 'MinIO URL hoặc YouTube'
										}
									/>
									{isBase64Audio ? (
										<p className="admin-grammar-field-hint admin-grammar-field-hint--warn">
											Bài cũ dùng base64 — chọn file bên dưới để chuyển lên MinIO.
										</p>
									) : null}
									<label
										className={`admin-grammar-file-upload${uploadingAudio ? ' admin-grammar-file-upload--loading' : ''}`}
										style={{ marginTop: 8 }}
									>
										<input
											type="file"
											accept="audio/*"
											hidden
											disabled={uploadingAudio}
											onChange={handleAudioFileUpload}
										/>
										{uploadingAudio ? (
											<span className="admin-grammar-upload-spinner" aria-hidden />
										) : null}
										<span>
											{uploadingAudio
												? 'Đang tải lên MinIO…'
												: hasUploadedAudio
													? '✓ Đã có audio — chọn để thay'
													: 'Chọn file âm thanh'}
										</span>
									</label>
								</div>

								{audioPreviewSrc && !uploadingAudio ? (
									<div className="admin-listening-audio-preview">
										<audio controls preload="metadata" src={audioPreviewSrc} />
									</div>
								) : null}

								<div className="admin-grammar-row-2">
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">Ảnh minh họa (URL)</label>
										<input
											type="text"
											className="admin-grammar-input"
											value={formImage}
											onChange={(e) => setFormImage(e.target.value)}
										/>
									</div>
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">Tải ảnh</label>
										<label
											className={`admin-grammar-file-upload${uploadingImage ? ' admin-grammar-file-upload--loading' : ''}`}
										>
											<input
												type="file"
												accept="image/*"
												hidden
												disabled={uploadingImage}
												onChange={handleImageFileUpload}
											/>
											{uploadingImage ? (
												<span className="admin-grammar-upload-spinner" aria-hidden />
											) : null}
											<span>
												{uploadingImage ? 'Đang tải…' : 'Chọn ảnh minh họa'}
											</span>
										</label>
									</div>
								</div>

								{imagePreviewSrc ? (
									<div className="admin-listening-image-preview">
										<img src={imagePreviewSrc} alt="Xem trước" decoding="async" />
									</div>
								) : null}

								<div className="admin-grammar-row-2">
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">Thứ tự hiển thị</label>
										<input
											type="number"
											className="admin-grammar-input"
											min={1}
											value={formDisplayOrder}
											onChange={(e) => setFormDisplayOrder(e.target.value)}
										/>
									</div>
									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label">Xuất bản</label>
										<div className="admin-grammar-switch-wrap">
											<button
												type="button"
												className={`admin-grammar-switch${formIsPublished ? ' admin-grammar-switch--on' : ''}`}
												onClick={() => setFormIsPublished(!formIsPublished)}
												aria-pressed={formIsPublished}
											>
												<span className="admin-grammar-switch-thumb" />
											</button>
											<span className="admin-grammar-switch-caption">
												{formIsPublished ? 'Công khai' : 'Nháp'}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeFormTab === 'script' && (
							<div className="admin-grammar-form-stack">
								<div className="admin-grammar-field">
									<label className="admin-grammar-label">
										Kịch bản tiếng Nhật <span className="admin-grammar-req">*</span>
									</label>
									<textarea
										className="admin-grammar-textarea"
										style={{ minHeight: 180 }}
										lang="ja"
										value={formScriptJa}
										onChange={(e) => setFormScriptJa(e.target.value)}
										required
									/>
								</div>
								<div className="admin-grammar-field">
									<label className="admin-grammar-label">Dịch tiếng Việt</label>
									<textarea
										className="admin-grammar-textarea"
										style={{ minHeight: 180 }}
										value={formScriptVi}
										onChange={(e) => setFormScriptVi(e.target.value)}
									/>
								</div>
							</div>
						)}

						{activeFormTab === 'questions' && (
							<div className="admin-grammar-form-stack">
								{formQuestions.map((q, qIndex) => (
									<div key={qIndex} className="admin-listening-q-card">
										<div className="admin-listening-q-card-header">
											<span className="admin-listening-q-card-title">
												Câu hỏi {qIndex + 1}
											</span>
											<button
												type="button"
												className="admin-grammar-btn admin-grammar-btn--ghost"
												onClick={() => handleRemoveQuestion(qIndex)}
											>
												Xóa
											</button>
										</div>
										<div
											className="admin-grammar-row-2"
											style={{ gridTemplateColumns: '1fr 1fr' }}
										>
											<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
												<label className="admin-grammar-label">Câu hỏi (VI)</label>
												<input
													type="text"
													className="admin-grammar-input"
													value={q.questionVi}
													onChange={(e) =>
														handleQuestionChange(qIndex, 'questionVi', e.target.value)
													}
												/>
											</div>
											<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
												<label className="admin-grammar-label">Câu hỏi (JA)</label>
												<input
													type="text"
													className="admin-grammar-input"
													value={q.questionJa}
													onChange={(e) =>
														handleQuestionChange(qIndex, 'questionJa', e.target.value)
													}
													lang="ja"
												/>
											</div>
										</div>
										<p className="admin-grammar-label" style={{ marginTop: 12 }}>
											Đáp án (chọn đáp án đúng) <span className="admin-grammar-req">*</span>
										</p>
										{q.choices.map((choice, cIndex) => (
											<div
												key={cIndex}
												className={`admin-listening-choice-row${q.answerIndex === cIndex ? ' admin-listening-choice-row--answer' : ''}`}
											>
												<input
													type="radio"
													name={`q_${qIndex}_answer`}
													checked={q.answerIndex === cIndex}
													onChange={() =>
														handleQuestionChange(qIndex, 'answerIndex', cIndex)
													}
													aria-label={`Đáp án đúng ${cIndex + 1}`}
												/>
												<div className="admin-listening-choice-fields">
													<input
														type="text"
														className="admin-grammar-input"
														value={choice}
														placeholder={`Đáp án chữ ${cIndex + 1}`}
														onChange={(e) =>
															handleChoiceChange(qIndex, cIndex, e.target.value)
														}
													/>
													<div className="admin-listening-choice-img-row">
														<input
															type="text"
															className="admin-grammar-input"
															style={{ flex: 1, fontSize: '0.8rem' }}
															value={q.choiceImages?.[cIndex] || ''}
															placeholder="URL ảnh đáp án"
															onChange={(e) =>
																handleChoiceImageChange(
																	qIndex,
																	cIndex,
																	e.target.value,
																)
															}
														/>
														<label
															className={`admin-grammar-file-upload admin-grammar-file-upload--compact${uploadingChoice === `${qIndex}-${cIndex}` ? ' admin-grammar-file-upload--loading' : ''}`}
														>
															<input
																type="file"
																accept="image/*"
																hidden
																disabled={
																	uploadingChoice === `${qIndex}-${cIndex}`
																}
																onChange={(e) =>
																	handleChoiceImageUpload(qIndex, cIndex, e)
																}
															/>
															<span>
																{uploadingChoice === `${qIndex}-${cIndex}`
																	? '…'
																	: 'Tải ảnh'}
															</span>
														</label>
													</div>
												</div>
											</div>
										))}
										<div className="admin-grammar-field" style={{ marginTop: 8 }}>
											<label className="admin-grammar-label">Giải thích</label>
											<input
												type="text"
												className="admin-grammar-input"
												value={q.explainVi}
												onChange={(e) =>
													handleQuestionChange(qIndex, 'explainVi', e.target.value)
												}
											/>
										</div>
									</div>
								))}
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--ghost admin-listening-add-q"
									onClick={handleAddQuestion}
								>
									+ Thêm câu hỏi
								</button>
							</div>
						)}
					</div>

					<div className="admin-grammar-modal-actions">
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--muted"
							onClick={onClose}
							disabled={isUploadingMedia}
						>
							Hủy
						</button>
						{activeFormTab !== 'questions' ? (
							<button
								type="button"
								className="admin-grammar-btn admin-grammar-btn--primary"
								disabled={isUploadingMedia}
								onClick={() => {
									if (activeFormTab === 'general') setActiveFormTab('script');
									else setActiveFormTab('questions');
								}}
							>
								{uploadingAudio ? 'Đang tải audio…' : 'Tiếp theo'}
							</button>
						) : (
							<button
								type="submit"
								className="admin-grammar-btn admin-grammar-btn--primary"
								disabled={isUploadingMedia}
							>
								{isUploadingMedia
									? 'Đang tải file…'
									: initialData
										? 'Lưu cập nhật'
										: 'Tạo bài nghe'}
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
