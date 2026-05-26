import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { getMembershipCheckoutReceipt } from '../services/membershipService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './AuthPage.css';
import './Profile.css';
import './DashboardHome.css';
import './Membership.css';
import './MembershipReceiptPage.css';

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

export default function MembershipReceiptPage() {
	const { checkoutId } = useParams();
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const lang = i18n.language || 'vi';

	const [receipt, setReceipt] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	useEffect(() => {
		if (!checkoutId || !user) return undefined;
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError('');
			try {
				const data = await getMembershipCheckoutReceipt(checkoutId);
				if (!cancelled) setReceipt(data);
			} catch (err) {
				if (!cancelled) setError(getApiErrorMessage(err, t));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [checkoutId, user, t]);

	const handlePrint = () => {
		window.print();
	};

	return (
		<Layout
			userName={headerName}
			streakDays={mockStreak.days}
			mainInnerClassName="membership-page membership-receipt-page"
		>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.membership'), to: '/membership' },
					{ label: t('breadcrumb.membershipHistory'), to: '/membership/history' },
					{ label: t('membershipReceipt.title') },
				]}
			/>

			<div className="membership-receipt-actions no-print">
				<Link className="membership-history-back" to="/membership/history">
					{t('membershipReceipt.back')}
				</Link>
				{receipt ? (
					<button
						type="button"
						className="membership-receipt-print-btn"
						onClick={handlePrint}
					>
						{t('membershipReceipt.print')}
					</button>
				) : null}
			</div>

			{loading ? (
				<p className="membership-checkout-status">{t('common.loading')}</p>
			) : null}
			{error ? (
				<p className="membership-checkout-error" role="alert">
					{error}
				</p>
			) : null}

			{receipt ? (
				<article className="membership-receipt-sheet profile-card">
					<header className="membership-receipt-head">
						<p className="membership-receipt-brand">Kotonote</p>
						<h1 className="membership-receipt-title">
							{t('membershipReceipt.invoiceTitle')}
						</h1>
						<p className="membership-receipt-number">
							{t('membershipReceipt.invoiceNo', {
								number: receipt.invoiceNumber,
							})}
						</p>
					</header>

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
							<dd className="membership-receipt-amount">
								{receipt.amountFormatted}
							</dd>
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

					<p className="membership-receipt-footer">
						{t('membershipReceipt.footer')}
					</p>
				</article>
			) : null}
		</Layout>
	);
}
