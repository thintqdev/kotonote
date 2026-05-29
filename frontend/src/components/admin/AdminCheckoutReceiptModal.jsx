import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminCheckoutReceipt } from '../../services/adminMembershipService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import '../../pages/MembershipReceiptPage.css';
import "./AdminCheckoutReceiptModal.css";
import "../../styles/adminModalLayout.css";

function formatWhen(iso, lang) {
	if (!iso) return '—';
	try {
		return new Date(iso).toLocaleString(
			lang.startsWith('ja') ? 'ja-JP' : 'vi-VN',
			{ dateStyle: 'medium', timeStyle: 'short' },
		);
	} catch {
		return '—';
	}
}

export default function AdminCheckoutReceiptModal({ checkoutId, open, onClose }) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language || 'vi';
	const [receipt, setReceipt] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!open || !checkoutId) return undefined;
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError('');
			setReceipt(null);
			try {
				const data = await getAdminCheckoutReceipt(checkoutId);
				if (!cancelled) setReceipt(data);
			} catch (err) {
				if (!cancelled) setError(getApiErrorMessage(err));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [open, checkoutId]);

	if (!open) return null;

	return (
		<div
			className="admin-receipt-modal-backdrop"
			role="presentation"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === 'Escape') onClose();
			}}
		>
			<div
				className="admin-receipt-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="admin-receipt-title"
				onClick={(e) => e.stopPropagation()}
			>
				<header className="admin-receipt-modal-head">
					<h2 id="admin-receipt-title">{t('membershipReceipt.invoiceTitle')}</h2>
					<button type="button" className="admin-receipt-close" onClick={onClose}>
						×
					</button>
				</header>

				{loading ? (
					<p className="admin-receipt-modal-status">{t('common.loading')}</p>
				) : null}
				{error ? (
					<p className="admin-receipt-modal-status admin-receipt-modal-status--error" role="alert">
						{error}
					</p>
				) : null}

				{receipt ? (
					<article className="membership-receipt-sheet">
						<p className="membership-receipt-number">
							{t('membershipReceipt.invoiceNo', { number: receipt.invoiceNumber })}
						</p>
						<dl className="membership-receipt-dl">
							<div className="membership-receipt-row">
								<dt>{t('membershipReceipt.buyer')}</dt>
								<dd>
									{receipt.buyer?.name}
									<br />
									{receipt.buyer?.email}
								</dd>
							</div>
							<div className="membership-receipt-row">
								<dt>{t('membershipReceipt.plan')}</dt>
								<dd>
									{t(`membershipPage.tiers.${receipt.tierId}.name`, receipt.tierId)}
									{' · '}
									{t(`membershipPage.billing.${receipt.billing}`, receipt.billing)}
								</dd>
							</div>
							<div className="membership-receipt-row">
								<dt>{t('membershipReceipt.amount')}</dt>
								<dd className="membership-receipt-amount">{receipt.amountFormatted}</dd>
							</div>
							<div className="membership-receipt-row">
								<dt>{t('membershipReceipt.paidAt')}</dt>
								<dd>{formatWhen(receipt.paidAt, lang)}</dd>
							</div>
							<div className="membership-receipt-row">
								<dt>{t('membershipReceipt.status')}</dt>
								<dd>
									{t(
										`membershipPaymentHistory.status.${receipt.status}`,
										receipt.status,
									)}
								</dd>
							</div>
							{receipt.providerTransactionId ? (
								<div className="membership-receipt-row">
									<dt>{t('membershipReceipt.transactionId')}</dt>
									<dd>{receipt.providerTransactionId}</dd>
								</div>
							) : null}
							{receipt.refundedAt ? (
								<div className="membership-receipt-row">
									<dt>{t('membershipReceipt.refundedAt')}</dt>
									<dd>{formatWhen(receipt.refundedAt, lang)}</dd>
								</div>
							) : null}
						</dl>
					</article>
				) : null}
			</div>
		</div>
	);
}
