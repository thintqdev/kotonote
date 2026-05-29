import { useEffect, useId, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { requestMembershipRefund } from '../../services/membershipService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';

export default function MembershipRefundRequestModal({
	open,
	checkoutId,
	onClose,
	onSubmitted,
}) {
	const { t } = useTranslation();
	const formId = useId();
	const [note, setNote] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!open) return;
		setNote('');
		setError('');
	}, [open, checkoutId]);

	if (!open || !checkoutId) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			await requestMembershipRefund(checkoutId, {
				note: note.trim() || undefined,
			});
			onSubmitted?.();
			onClose();
		} catch (err) {
			setError(getApiErrorMessage(err, t));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			className="membership-refund-modal-backdrop"
			role="presentation"
			onClick={() => !saving && onClose()}
		>
			<div
				className="membership-refund-modal profile-card"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${formId}-title`}
				onClick={(ev) => ev.stopPropagation()}
			>
				<h2 id={`${formId}-title`} className="membership-refund-modal-title">
					{t('membershipPaymentHistory.refundRequestTitle')}
				</h2>
				<p className="membership-refund-modal-lead">
					{t('membershipPaymentHistory.refundRequestLead')}
				</p>

				<form onSubmit={handleSubmit}>
					<label className="profile-field" htmlFor={`${formId}-note`}>
						<span className="profile-field-label">
							{t('membershipPaymentHistory.refundRequestNoteLabel')}
						</span>
						<textarea
							id={`${formId}-note`}
							className="profile-textarea"
							rows={4}
							maxLength={500}
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder={t('membershipPaymentHistory.refundRequestNotePlaceholder')}
						/>
					</label>

					{error ? (
						<p className="membership-refund-modal-error" role="alert">
							{error}
						</p>
					) : null}

					<div className="membership-refund-modal-actions">
						<button
							type="button"
							className="membership-pay-page-btn"
							onClick={onClose}
							disabled={saving}
						>
							{t('profile.cancel')}
						</button>
						<button
							type="submit"
							className="membership-pay-page-btn membership-refund-modal-submit"
							disabled={saving}
						>
							{saving
								? t('membershipPaymentHistory.refundRequestSubmitting')
								: t('membershipPaymentHistory.refundRequestSubmit')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

MembershipRefundRequestModal.propTypes = {
	open: PropTypes.bool.isRequired,
	checkoutId: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onSubmitted: PropTypes.func,
};
