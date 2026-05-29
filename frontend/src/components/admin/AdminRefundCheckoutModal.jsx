import { useEffect, useId, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import { refundAdminCheckout } from '../../services/adminMembershipService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import '../../styles/adminModalLayout.css';

function formatWhen(iso) {
	if (!iso) return '—';
	try {
		return new Date(iso).toLocaleString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return '—';
	}
}

export default function AdminRefundCheckoutModal({
	open,
	checkout,
	onClose,
	onRefunded,
}) {
	const formId = useId();
	const [reason, setReason] = useState('');
	const [revokeMembership, setRevokeMembership] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		setReason('');
		setRevokeMembership(true);
	}, [open, checkout?.id, checkout?._id]);

	if (!open || !checkout) return null;

	const checkoutId = checkout.id ?? checkout._id;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const result = await refundAdminCheckout(checkoutId, {
				reason: reason.trim() || undefined,
				revokeMembership,
			});
			toast.success('Đã ghi nhận hoàn tiền', {
				description: result.membershipRevoked
					? 'Đã thu hồi gói membership của user.'
					: 'Checkout đã đánh dấu refunded.',
			});
			onRefunded?.();
			onClose();
		} catch (err) {
			toast.error('Hoàn tiền thất bại', { description: getApiErrorMessage(err) });
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			className="admin-grammar-modal-backdrop"
			role="presentation"
			onClick={() => !saving && onClose()}
		>
			<div
				className="admin-grammar-modal admin-grammar-modal--narrow"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${formId}-title`}
				onClick={(ev) => ev.stopPropagation()}
			>
				<div className="admin-grammar-modal-header">
					<h2 id={`${formId}-title`} className="admin-grammar-modal-title">
						Xác nhận hoàn tiền
					</h2>
					<button
						type="button"
						className="admin-grammar-modal-close"
						onClick={onClose}
						disabled={saving}
						aria-label="Đóng"
					>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="admin-grammar-modal-body admin-grammar-modal-body--tight-foot">
						<p className="admin-subs-modal-user">
							<strong>{checkout.user?.name ?? '—'}</strong>
							<br />
							<span>{checkout.user?.email ?? checkout.userId}</span>
						</p>

						{checkout.refundRequestNote ? (
							<div className="admin-subs-refund-user-note">
								<p className="admin-grammar-label">Lý do user gửi</p>
								<p className="admin-subs-refund-user-note-text">
									{checkout.refundRequestNote}
								</p>
								<p className="admin-subs-refund-user-note-meta">
									Yêu cầu lúc: {formatWhen(checkout.refundRequestedAt)}
								</p>
							</div>
						) : null}

						<p className="admin-modal-lead">
							Ghi nhận hoàn trong hệ thống. Tiền hoàn thật trên PayOS cần xử lý
							trên dashboard PayOS.
						</p>

						<div className="admin-grammar-field">
							<label className="admin-grammar-label" htmlFor={`${formId}-reason`}>
								Ghi chú admin (tuỳ chọn)
							</label>
							<textarea
								id={`${formId}-reason`}
								className="admin-grammar-textarea"
								rows={3}
								maxLength={500}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</div>

						<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
							<label className="admin-grammar-label" htmlFor={`${formId}-revoke`}>
								Thu hồi gói membership
							</label>
							<div className="admin-grammar-switch-wrap">
								<button
									id={`${formId}-revoke`}
									type="button"
									className={`admin-grammar-switch${revokeMembership ? ' admin-grammar-switch--on' : ''}`}
									onClick={() => setRevokeMembership((v) => !v)}
									role="switch"
									aria-checked={revokeMembership}
								>
									<span className="admin-grammar-switch-thumb" aria-hidden />
								</button>
								<span className="admin-grammar-switch-caption">
									{revokeMembership
										? 'Hạ về Free nếu gói khớp checkout này'
										: 'Chỉ đánh dấu refunded'}
								</span>
							</div>
						</div>
					</div>

					<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--muted"
							onClick={onClose}
							disabled={saving}
						>
							Hủy
						</button>
						<button
							type="submit"
							className="admin-grammar-btn admin-grammar-btn--primary"
							disabled={saving}
						>
							{saving ? 'Đang xử lý…' : 'Xác nhận hoàn tiền'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

AdminRefundCheckoutModal.propTypes = {
	open: PropTypes.bool.isRequired,
	checkout: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onRefunded: PropTypes.func,
};
