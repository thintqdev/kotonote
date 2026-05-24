import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import { uploadExamPaperThumbnail } from '../../services/adminExamPaperService.js';
import {
	EXAM_DEFAULT_DURATION,
	EXAM_JLPT_LEVELS,
	EXAM_SESSION_OPTIONS,
	EXAM_SOURCE_OPTIONS,
	examYearOptions,
} from '../../constants/examPaperFieldMeta.js';
import './AdminGrammarPage.css';

export default function ExamPaperFormModal({ isOpen, onClose, initialData, onSubmit }) {
	const [titleVi, setTitleVi] = useState('');
	const [titleJa, setTitleJa] = useState('');
	const [jlpt, setJlpt] = useState('N3');
	const [year, setYear] = useState(new Date().getFullYear());
	const [session, setSession] = useState('july');
	const [durationMinutes, setDurationMinutes] = useState(EXAM_DEFAULT_DURATION.N3);
	const [descriptionVi, setDescriptionVi] = useState('');
	const [sourceType, setSourceType] = useState('past_exam');
	const [sourceNote, setSourceNote] = useState('');
	const [thumbnailUrl, setThumbnailUrl] = useState('');
	const [isPublished, setIsPublished] = useState(false);
	const [displayOrder, setDisplayOrder] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [thumbnailUploading, setThumbnailUploading] = useState(false);
	const [thumbnailDragOver, setThumbnailDragOver] = useState(false);
	const thumbnailFileRef = useRef(null);

	const thumbnailPreviewSrc = resolvePublicMediaUrl(thumbnailUrl);

	useEffect(() => {
		if (!isOpen) return;
		if (initialData) {
			setTitleVi(initialData.titleVi || '');
			setTitleJa(initialData.titleJa || '');
			setJlpt(initialData.jlpt || 'N3');
			setYear(initialData.year || new Date().getFullYear());
			setSession(initialData.session || 'july');
			setDurationMinutes(initialData.durationMinutes ?? EXAM_DEFAULT_DURATION.N3);
			setDescriptionVi(initialData.descriptionVi || '');
			setSourceType(initialData.sourceType || 'past_exam');
			setSourceNote(initialData.sourceNote || '');
			setThumbnailUrl(initialData.thumbnailUrl || '');
			setIsPublished(Boolean(initialData.isPublished));
			setDisplayOrder(initialData.displayOrder ?? 0);
		} else {
			setTitleVi('');
			setTitleJa('');
			setJlpt('N3');
			setYear(new Date().getFullYear());
			setSession('july');
			setDurationMinutes(EXAM_DEFAULT_DURATION.N3);
			setDescriptionVi('');
			setSourceType('past_exam');
			setSourceNote('');
			setThumbnailUrl('');
			setIsPublished(false);
			setDisplayOrder(0);
		}
	}, [isOpen, initialData]);

	useEffect(() => {
		if (initialData || !isOpen) return;
		setDurationMinutes(EXAM_DEFAULT_DURATION[jlpt] ?? 140);
	}, [jlpt, initialData, isOpen]);

	if (!isOpen) return null;

	const uploadThumbnailFile = async (file) => {
		if (!file || !file.type.startsWith('image/')) {
			toast.error('Chọn file ảnh (PNG, JPEG, WebP, GIF)');
			return;
		}
		setThumbnailUploading(true);
		try {
			const { thumbnailUrl: url } = await uploadExamPaperThumbnail(file);
			if (url) setThumbnailUrl(url);
		} catch (err) {
			toast.error('Không tải được ảnh', {
				description: getApiErrorMessage(err),
			});
		} finally {
			setThumbnailUploading(false);
		}
	};

	const onThumbnailFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) void uploadThumbnailFile(file);
		e.target.value = '';
	};

	const onThumbnailDrop = (e) => {
		e.preventDefault();
		setThumbnailDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) void uploadThumbnailFile(file);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			await onSubmit({
				titleVi: titleVi.trim(),
				titleJa: titleJa.trim(),
				jlpt,
				year: Number(year),
				session,
				durationMinutes: Number(durationMinutes) || 0,
				descriptionVi: descriptionVi.trim(),
				sourceType,
				sourceNote: sourceNote.trim(),
				thumbnailUrl: thumbnailUrl.trim(),
				isPublished,
				displayOrder: Number(displayOrder) || 0,
			});
			onClose();
		} catch (err) {
			toast.error('Không lưu được đề thi', {
				description: getApiErrorMessage(err),
			});
		} finally {
			setSubmitting(false);
		}
	};

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
				aria-labelledby="exam-paper-modal-title"
			>
				<div className="admin-grammar-modal-header">
					<h2 id="exam-paper-modal-title" className="admin-grammar-modal-title">
						{initialData ? 'Sửa đề thi JLPT' : 'Thêm đề thi JLPT'}
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

				<form onSubmit={handleSubmit}>
					<div className="admin-grammar-modal-body admin-grammar-modal-body--tight-foot">
						<div className="admin-grammar-form-stack">
							<div className="admin-grammar-row-3">
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-jlpt">
										Cấp JLPT <span className="admin-grammar-req">*</span>
									</label>
									<select
										id="ep-jlpt"
										className="admin-grammar-select"
										value={jlpt}
										onChange={(e) => setJlpt(e.target.value)}
										required
									>
										{EXAM_JLPT_LEVELS.map((lv) => (
											<option key={lv} value={lv}>
												{lv}
											</option>
										))}
									</select>
								</div>
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-year">
										Năm thi <span className="admin-grammar-req">*</span>
									</label>
									<select
										id="ep-year"
										className="admin-grammar-select"
										value={year}
										onChange={(e) => setYear(Number(e.target.value))}
										required
									>
										{examYearOptions().map((y) => (
											<option key={y} value={y}>
												{y}
											</option>
										))}
									</select>
								</div>
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-session">
										Kỳ thi <span className="admin-grammar-req">*</span>
									</label>
									<select
										id="ep-session"
										className="admin-grammar-select"
										value={session}
										onChange={(e) => setSession(e.target.value)}
										required
									>
										{EXAM_SESSION_OPTIONS.map((o) => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="admin-grammar-row-3">
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-duration">
										Thời gian (phút)
									</label>
									<input
										id="ep-duration"
										type="number"
										className="admin-grammar-input"
										min={0}
										value={durationMinutes}
										onChange={(e) => setDurationMinutes(e.target.value)}
									/>
								</div>
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-source">
										Loại đề
									</label>
									<select
										id="ep-source"
										className="admin-grammar-select"
										value={sourceType}
										onChange={(e) => setSourceType(e.target.value)}
									>
										{EXAM_SOURCE_OPTIONS.map((o) => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
								</div>
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-order">
										Thứ tự hiển thị
									</label>
									<input
										id="ep-order"
										type="number"
										className="admin-grammar-input"
										min={0}
										value={displayOrder}
										onChange={(e) => setDisplayOrder(e.target.value)}
									/>
								</div>
							</div>

							<div
								className="admin-grammar-row-2"
								style={{ gridTemplateColumns: '1.2fr 1fr' }}
							>
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-title-vi">
										Tiêu đề (VI)
									</label>
									<input
										id="ep-title-vi"
										type="text"
										className="admin-grammar-input"
										value={titleVi}
										onChange={(e) => setTitleVi(e.target.value)}
										placeholder="Để trống → tự tạo theo JLPT/năm/kỳ"
										maxLength={200}
									/>
								</div>
								<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
									<label className="admin-grammar-label" htmlFor="ep-title-ja">
										Tiêu đề (JA)
									</label>
									<input
										id="ep-title-ja"
										type="text"
										className="admin-grammar-input"
										value={titleJa}
										onChange={(e) => setTitleJa(e.target.value)}
										maxLength={200}
										lang="ja"
									/>
								</div>
							</div>

							<div className="admin-reading-cover-field">
								<span className="admin-reading-cover-label">Ảnh thumbnail</span>
								<p className="admin-reading-cover-hint">
									Tải ảnh từ máy (lưu trên server) hoặc dán URL bên ngoài.
								</p>
								{thumbnailPreviewSrc ? (
									<div className="admin-reading-cover-preview">
										<img src={thumbnailPreviewSrc} alt="" decoding="async" />
									</div>
								) : null}
								<input
									ref={thumbnailFileRef}
									type="file"
									className="admin-reading-file-hidden"
									accept="image/png,image/jpeg,image/webp,image/gif"
									onChange={onThumbnailFileChange}
									disabled={thumbnailUploading}
								/>
								<button
									type="button"
									className={`admin-reading-cover-upload${thumbnailDragOver ? ' admin-reading-cover-upload--drag' : ''}`}
									disabled={thumbnailUploading}
									onClick={() => thumbnailFileRef.current?.click()}
									onDragOver={(e) => {
										e.preventDefault();
										setThumbnailDragOver(true);
									}}
									onDragLeave={() => setThumbnailDragOver(false)}
									onDrop={onThumbnailDrop}
								>
									{thumbnailUploading
										? 'Đang tải lên…'
										: 'Kéo thả ảnh vào đây hoặc bấm để chọn file'}
								</button>
								<div className="admin-cover-url-divider" aria-hidden>
									<span>hoặc</span>
								</div>
								<div className="admin-grammar-field admin-cover-url-field">
									<label className="admin-grammar-label" htmlFor="ep-thumbnail-url">
										Link ảnh (URL)
									</label>
									<input
										id="ep-thumbnail-url"
										type="url"
										className="admin-grammar-input"
										value={thumbnailUrl}
										onChange={(e) => setThumbnailUrl(e.target.value)}
										placeholder="https://example.com/cover.jpg"
										autoComplete="off"
									/>
								</div>
							</div>

							<div className="admin-grammar-field">
								<label className="admin-grammar-label" htmlFor="ep-source-note">
									Ghi chú nguồn
								</label>
								<input
									id="ep-source-note"
									type="text"
									className="admin-grammar-input"
									value={sourceNote}
									onChange={(e) => setSourceNote(e.target.value)}
									placeholder="VD: JLPT N3 2023年7月 — 公式"
									maxLength={500}
								/>
							</div>

							<div className="admin-grammar-field">
								<label className="admin-grammar-label" htmlFor="ep-desc">
									Mô tả / hướng dẫn
								</label>
								<textarea
									id="ep-desc"
									className="admin-grammar-textarea"
									rows={3}
									value={descriptionVi}
									onChange={(e) => setDescriptionVi(e.target.value)}
									maxLength={4000}
								/>
							</div>

							<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
								<label className="admin-grammar-label" htmlFor="ep-published-switch">
									Xuất bản
								</label>
								<div className="admin-grammar-switch-wrap">
									<button
										id="ep-published-switch"
										type="button"
										className={`admin-grammar-switch${isPublished ? ' admin-grammar-switch--on' : ''}`}
										onClick={() => setIsPublished((v) => !v)}
										role="switch"
										aria-checked={isPublished}
									>
										<span className="admin-grammar-switch-thumb" aria-hidden />
									</button>
									<span className="admin-grammar-switch-caption">
										{isPublished
											? 'Công khai — học viên sẽ thấy sau này'
											: 'Nháp — chỉ admin'}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--muted"
							onClick={onClose}
							disabled={submitting}
						>
							Hủy
						</button>
						<button
							type="submit"
							className="admin-grammar-btn admin-grammar-btn--primary"
							disabled={submitting}
						>
							{submitting ? 'Đang lưu…' : initialData ? 'Lưu cập nhật' : 'Tạo đề thi'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
