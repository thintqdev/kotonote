import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import {
	getAdminReadingSentenceAnalysis,
	regenerateAdminReadingSentenceAnalysis,
} from '../../services/adminReadingService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';

const formatTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '—');

/** Trạng thái cache phân tích chủ/vị + ngữ pháp từng câu dùng cho luyện dịch phía học viên. */
export default function AdminReadingSentenceAnalysisPanel({ articleId }) {
	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [regenerating, setRegenerating] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			setStatus(await getAdminReadingSentenceAnalysis(articleId));
		} catch (e) {
			toast.error('Không tải được trạng thái phân tích câu', {
				description: getApiErrorMessage(e),
			});
		} finally {
			setLoading(false);
		}
	}, [articleId]);

	useEffect(() => {
		void load();
	}, [load]);

	const handleRegenerate = async () => {
		setRegenerating(true);
		try {
			const next = await regenerateAdminReadingSentenceAnalysis(articleId);
			setStatus(next);
			if (next.analyzedCount < next.totalSentences) {
				toast.warning(
					`Đã phân tích ${next.analyzedCount}/${next.totalSentences} câu — các câu còn lại sẽ được tạo khi học viên nộp.`,
				);
			} else {
				toast.success('Đã tạo lại phân tích câu');
			}
		} catch (e) {
			toast.error('Không tạo lại được phân tích câu', {
				description: getApiErrorMessage(e),
			});
		} finally {
			setRegenerating(false);
		}
	};

	return (
		<div className="admin-grammar-subblock admin-reading-sentence-panel">
			<p className="admin-reading-cover-label">Phân tích câu cho luyện dịch (AI)</p>
			<p className="admin-reading-cover-hint">
				Tách theo nội dung <strong>đã lưu</strong>. Khi sửa nội dung bài, phân tích cũ tự bỏ và
				được tạo lại dần khi học viên nộp; bấm nút dưới để tạo sẵn toàn bộ (có thể mất vài phút
				với bài dài).
			</p>
			{loading ? (
				<p className="admin-grammar-status">Đang tải…</p>
			) : status ? (
				<p className="admin-reading-sentence-stats">
					Đã phân tích <strong>{status.analyzedCount}</strong> / {status.totalSentences} câu
					{status.stale ? ' · nội dung đã đổi, phân tích cũ không còn dùng' : ''} · Cập nhật:{' '}
					{formatTime(status.updatedAt)}
				</p>
			) : null}
			<button
				type="button"
				className="admin-grammar-btn admin-grammar-btn--ghost"
				disabled={regenerating || loading || !status?.totalSentences}
				onClick={() => void handleRegenerate()}
			>
				{regenerating ? 'AI đang phân tích…' : 'Tạo lại phân tích câu'}
			</button>
		</div>
	);
}

AdminReadingSentenceAnalysisPanel.propTypes = {
	articleId: PropTypes.string.isRequired,
};
