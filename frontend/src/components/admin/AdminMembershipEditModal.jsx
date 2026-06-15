import { useEffect, useId, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import {
	MEMBERSHIP_BILLING_OPTIONS,
	MEMBERSHIP_STATUS_OPTIONS,
	MEMBERSHIP_TIER_OPTIONS,
} from '../../constants/adminMembershipFieldMeta.js';
import { JLPT_BY_TIER } from '../../constants/membershipPlans.js';
import { patchAdminUserMembership } from '../../services/adminMembershipService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import '../../styles/adminModalLayout.css';

function toDatetimeLocalValue(iso) {
	if (!iso) return '';
	try {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return '';
		const pad = (n) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	} catch {
		return '';
	}
}

export default function AdminMembershipEditModal({
	open,
	user,
	onClose,
	onSaved,
}) {
	const formId = useId();
	const [tierId, setTierId] = useState('free');
	const [billing, setBilling] = useState('free');
	const [status, setStatus] = useState('active');
	const [expiresAtLocal, setExpiresAtLocal] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open || !user) return;
		const m = user.membership ?? {};
		setTierId(m.tierId || 'free');
		setBilling(m.billing || 'free');
		setStatus(m.status || 'active');
		setExpiresAtLocal(toDatetimeLocalValue(m.expiresAt));
	}, [open, user]);

	useEffect(() => {
		if (tierId === 'free') setBilling('free');
	}, [tierId]);

	if (!open || !user) return null;

	const jlptPreview = JLPT_BY_TIER[tierId] ?? JLPT_BY_TIER.free;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const payload = {
				tierId,
				billing: tierId === 'free' ? 'free' : billing,
				status,
			};
			if (tierId !== 'free' && billing === 'yearly') {
				payload.expiresAt = expiresAtLocal
					? new Date(expiresAtLocal).toISOString()
					: null;
			} else if (tierId !== 'free' && billing === 'lifetime') {
				payload.expiresAt = null;
			} else {
				payload.expiresAt = null;
			}

			await patchAdminUserMembership(user.id ?? user._id, payload);
			toast.success('Đã cập nhật gói membership');
			onSaved?.();
			onClose();
		} catch (err) {
			toast.error(getApiErrorMessage(err));
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
						Chỉnh gói membership
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
							<strong>{user.name}</strong>
							<br />
							<span>{user.email}</span>
						</p>

						<div className="admin-grammar-field">
							<label className="admin-grammar-label" htmlFor={`${formId}-tier`}>
								Gói
							</label>
							<select
								id={`${formId}-tier`}
								className="admin-grammar-select"
								value={tierId}
								onChange={(e) => setTierId(e.target.value)}
							>
								{MEMBERSHIP_TIER_OPTIONS.map((o) => (
									<option key={o.value} value={o.value}>
										{o.label}
									</option>
								))}
							</select>
						</div>

						<div className="admin-grammar-field">
							<label className="admin-grammar-label" htmlFor={`${formId}-billing`}>
								Thanh toán
							</label>
							<select
								id={`${formId}-billing`}
								className="admin-grammar-select"
								value={billing}
								disabled={tierId === 'free'}
								onChange={(e) => setBilling(e.target.value)}
							>
								{MEMBERSHIP_BILLING_OPTIONS.map((o) => (
									<option key={o.value} value={o.value}>
										{o.label}
									</option>
								))}
							</select>
						</div>

						<div className="admin-grammar-field">
							<label className="admin-grammar-label" htmlFor={`${formId}-status`}>
								Trạng thái gói
							</label>
							<select
								id={`${formId}-status`}
								className="admin-grammar-select"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
							>
								{MEMBERSHIP_STATUS_OPTIONS.map((o) => (
									<option key={o.value} value={o.value}>
										{o.label}
									</option>
								))}
							</select>
						</div>

						{tierId !== 'free' && billing === 'yearly' ? (
							<div className="admin-grammar-field">
								<label
									className="admin-grammar-label"
									htmlFor={`${formId}-expires`}
								>
									Hết hạn (tuỳ chọn)
								</label>
								<input
									id={`${formId}-expires`}
									type="datetime-local"
									className="admin-grammar-input"
									value={expiresAtLocal}
									onChange={(e) => setExpiresAtLocal(e.target.value)}
								/>
							</div>
						) : null}

						<p className="admin-subs-jlpt-preview">
							JLPT mở khóa: <strong>{jlptPreview.join(', ')}</strong>
						</p>
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
							{saving ? 'Đang lưu…' : 'Lưu gói'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

AdminMembershipEditModal.propTypes = {
	open: PropTypes.bool.isRequired,
	user: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onSaved: PropTypes.func,
};
