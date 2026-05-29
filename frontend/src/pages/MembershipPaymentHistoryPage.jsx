import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import MembershipRefundRequestModal from '../components/membership/MembershipRefundRequestModal.jsx';
import { getMembershipCheckoutHistory } from '../services/membershipService.js';
import { formatVnd } from '../constants/membershipPlans.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './AuthPage.css';
import './Profile.css';
import './DashboardHome.css';
import './Membership.css';
import './MembershipPaymentHistoryPage.css';

const PAGE_LIMIT = 15;

const STATUS_FILTERS = [
	{ value: '', key: 'all' },
	{ value: 'paid', key: 'paid' },
	{ value: 'pending', key: 'pending' },
	{ value: 'refunded', key: 'refunded' },
	{ value: 'expired', key: 'expired' },
	{ value: 'cancelled', key: 'cancelled' },
];

function formatWhen(iso, lang) {
	if (!iso) return '—';
	try {
		return new Date(iso).toLocaleString(
			lang.startsWith('ja') ? 'ja-JP' : 'vi-VN',
			{
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			},
		);
	} catch {
		return '—';
	}
}

function statusClass(status) {
	if (status === 'paid') return 'membership-pay-status--paid';
	if (status === 'pending') return 'membership-pay-status--pending';
	if (status === 'refunded') return 'membership-pay-status--refunded';
	if (status === 'cancelled') return 'membership-pay-status--cancelled';
	return 'membership-pay-status--expired';
}

export default function MembershipPaymentHistoryPage() {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const lang = i18n.language || 'vi';
	const locale = lang.startsWith('ja') ? 'ja-JP' : 'vi-VN';

	const [statusFilter, setStatusFilter] = useState('');
	const [page, setPage] = useState(1);
	const [checkouts, setCheckouts] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [refundRequestId, setRefundRequestId] = useState('');

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	const userId = user?.id ?? user?._id;

	const query = useMemo(
		() => ({
			page,
			limit: PAGE_LIMIT,
			...(statusFilter ? { status: statusFilter } : {}),
		}),
		[page, statusFilter],
	);

	const loadHistory = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const data = await getMembershipCheckoutHistory(query);
			setCheckouts(data.checkouts ?? []);
			setPagination(data.pagination ?? null);
		} catch (err) {
			setError(getApiErrorMessage(err, t));
			setCheckouts([]);
			setPagination(null);
		} finally {
			setLoading(false);
		}
	}, [query, t]);

	useEffect(() => {
		if (!userId) return;
		void loadHistory();
	}, [userId, loadHistory]);

	useEffect(() => {
		setPage(1);
	}, [statusFilter]);

	const totalPages = pagination?.pages ?? 1;

	return (
		<Layout
			userName={headerName}
			streakDays={mockStreak.days}
			mainInnerClassName="membership-page membership-payment-history-page"
		>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.membership'), to: '/membership' },
					{ label: t('membershipPaymentHistory.title') },
				]}
			/>

			<section className="membership-intro profile-card profile-card--hero">
				<span className="profile-card-tape" aria-hidden />
				<Link className="membership-history-back" to="/membership">
					{t('membershipPaymentHistory.back')}
				</Link>
				<h1 className="membership-title profile-section-title">
					{t('membershipPaymentHistory.title')}
				</h1>
				<p className="membership-subtitle">
					{t('membershipPaymentHistory.subtitle')}
				</p>
			</section>

			<div
				className="membership-pay-filters"
				role="tablist"
				aria-label={t('membershipPaymentHistory.filterAria')}
			>
				{STATUS_FILTERS.map(({ value, key }) => (
					<button
						key={key}
						type="button"
						role="tab"
						aria-selected={statusFilter === value}
						className={`membership-pay-filter-btn${statusFilter === value ? ' membership-pay-filter-btn--active' : ''}`}
						onClick={() => setStatusFilter(value)}
					>
						{t(`membershipPaymentHistory.filters.${key}`)}
					</button>
				))}
			</div>

			{error ? (
				<p className="membership-checkout-error" role="alert">
					{error}
				</p>
			) : null}

			{loading ? (
				<p className="membership-checkout-status">{t('common.loading')}</p>
			) : null}

			{!loading && !error && checkouts.length === 0 ? (
				<p className="membership-checkout-status membership-pay-empty">
					{t('membershipPaymentHistory.empty')}
				</p>
			) : null}

			{!loading && !error && checkouts.length > 0 ? (
				<ul className="membership-pay-list">
					{checkouts.map((row) => {
						const id = row.checkoutId ?? row.id;
						const when = row.paidAt ?? row.createdAt;
						const tierName = t(
							`membershipPage.tiers.${row.tierId}.name`,
							row.tierId,
						);
						const billingLabel = t(
							`membershipPage.billing.${row.billing}`,
							row.billing,
						);
						return (
							<li key={id} className="membership-pay-card profile-card">
								<div className="membership-pay-card-head">
									<div>
										<p className="membership-pay-card-tier">
											{tierName}
											<span className="membership-pay-card-billing">
												{' '}
												· {billingLabel}
											</span>
										</p>
										<p className="membership-pay-card-date">
											{t('membershipPaymentHistory.dateLabel', {
												when: formatWhen(when, lang),
											})}
										</p>
									</div>
									<span
										className={`membership-pay-status ${statusClass(row.status)}`}
									>
										{t(
											`membershipPaymentHistory.status.${row.status}`,
											row.status,
										)}
									</span>
								</div>
								<p className="membership-pay-card-amount">
									{formatVnd(row.amountVnd ?? 0, locale)}
								</p>
								{row.status === 'pending' ? (
									<p className="membership-pay-card-note">
										{t('membershipPaymentHistory.pendingNote')}
									</p>
								) : null}
								<div className="membership-pay-card-actions">
									{row.status === 'paid' || row.status === 'refunded' ? (
										<Link
											className="membership-history-link"
											to={`/membership/receipt/${id}`}
										>
											{t('membershipPaymentHistory.viewReceipt')}
										</Link>
									) : null}
									{row.status === 'paid' && !row.refundRequestedAt ? (
										<button
											type="button"
											className="membership-history-link membership-history-link--button"
											onClick={() => setRefundRequestId(id)}
										>
											{t('membershipPaymentHistory.requestRefund')}
										</button>
									) : null}
									{row.status === 'paid' && row.refundRequestedAt ? (
										<span className="membership-pay-refund-pending">
											{t('membershipPaymentHistory.refundPending')}
										</span>
									) : null}
								</div>
							</li>
						);
					})}
				</ul>
			) : null}

			{!loading && totalPages > 1 ? (
				<nav
					className="membership-pay-pagination"
					aria-label={t('membershipPaymentHistory.paginationAria')}
				>
					<button
						type="button"
						className="membership-pay-page-btn"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						{t('membershipPaymentHistory.prev')}
					</button>
					<span className="membership-pay-page-info">
						{t('membershipPaymentHistory.pageInfo', {
							page,
							pages: totalPages,
						})}
					</span>
					<button
						type="button"
						className="membership-pay-page-btn"
						disabled={page >= totalPages}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					>
						{t('membershipPaymentHistory.next')}
					</button>
				</nav>
			) : null}

			<MembershipRefundRequestModal
				open={Boolean(refundRequestId)}
				checkoutId={refundRequestId}
				onClose={() => setRefundRequestId('')}
				onSubmitted={() => {
					toast.success(t('membershipPaymentHistory.refundRequestSuccess'));
					void loadHistory();
				}}
			/>
		</Layout>
	);
}
