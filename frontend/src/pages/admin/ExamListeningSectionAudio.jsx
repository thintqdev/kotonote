import { useState } from 'react';
import { toast } from 'sonner';
import { uploadExamMedia, updateAdminExamPaper } from '../../services/adminExamPaperService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import ExamListeningAudioPlayer from '../../components/exam/ExamListeningAudioPlayer.jsx';

/**
 * Audio toàn khối nghe hiểu — ngoài các part, gắn với đề thi.
 */
export default function ExamListeningSectionAudio({ paperId, audioUrl, onSaved }) {
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);
	const previewSrc = audioUrl ? resolvePublicMediaUrl(audioUrl) : null;

	const persistAudio = async (url) => {
		setSaving(true);
		try {
			const updated = await updateAdminExamPaper(paperId, {
				listeningAudioUrl: url,
			});
			onSaved?.(updated.listeningAudioUrl ?? url);
			toast.success(url ? 'Đã lưu audio nghe hiểu' : 'Đã xóa audio nghe hiểu');
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const handleUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('audio/')) {
			toast.error('Chỉ chấp nhận file audio');
			e.target.value = '';
			return;
		}
		if (file.size > 8 * 1024 * 1024) {
			toast.error('Audio tối đa 8MB');
			e.target.value = '';
			return;
		}
		setUploading(true);
		try {
			const { url } = await uploadExamMedia(file);
			await persistAudio(url);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setUploading(false);
			e.target.value = '';
		}
	};

	const busy = uploading || saving;

	return (
		<section className="exam-listening-section-audio grammar-box">
			<h2 className="exam-listening-section-audio-title">Audio toàn phần nghe hiểu</h2>
			<p className="exam-field-hint">
				Một file audio dùng chung cho toàn bộ khối nghe hiểu (không thuộc part cụ thể).
				Các part bên dưới chỉ chứa câu hỏi và ảnh minh họa từng câu.
			</p>
			<label
				className={`admin-grammar-file-upload exam-media-upload-btn${busy ? ' admin-grammar-file-upload--loading' : ''}`}
			>
				<input
					type="file"
					accept="audio/*"
					hidden
					disabled={busy}
					onChange={(e) => void handleUpload(e)}
				/>
				{busy ? <span className="admin-grammar-upload-spinner" aria-hidden /> : null}
				<span>
					{busy
						? 'Đang xử lý…'
						: previewSrc
							? '✓ Đã có audio — chọn để thay'
							: 'Chọn file audio'}
				</span>
			</label>
			{previewSrc ? (
				<div className="exam-media-preview-wrap">
					<ExamListeningAudioPlayer src={previewSrc} variant="admin" />
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost exam-media-clear"
						disabled={busy}
						onClick={() => void persistAudio('')}
					>
						Xóa audio
					</button>
				</div>
			) : null}
		</section>
	);
}
