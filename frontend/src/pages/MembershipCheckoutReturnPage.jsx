import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { getMembershipCheckoutStatus } from '../services/membershipService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './AuthPage.css';
import './Profile.css';
import './DashboardHome.css';
import './Membership.css';

const POLL_MS = 2000;
const MAX_POLLS = 30;

export default function MembershipCheckoutReturnPage() {
	const { t } = useTranslation();
	const { user, refreshUser } = useAuth();
	const [searchParams] = useSearchParams();
	const checkoutId = searchParams.get('checkoutId') || '';
	const resultHint = searchParams.get('result');
	const cancelled = resultHint === 'cancel';

	const [phase, setPhase] = useState('polling');
	const [error, setError] = useState('');
	const pollCount = useRef(0);

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	useEffect(() => {
		if (!user || !checkoutId) {
			setPhase('error');
			setError(t('membershipCheckoutReturn.invalidSession'));
			return undefined;
		}

		if (cancelled) {
			setPhase('cancelled');
			return undefined;
		}

		let cancelledPoll = false;
		let timerId = null;

		const poll = async () => {
			pollCount.current += 1;
			try {
				const data = await getMembershipCheckoutStatus(checkoutId);
				const status = data.checkout?.status;
				if (status === 'paid') {
					await refreshUser();
					if (!cancelledPoll) setPhase('success');
					return;
				}
				if (status === 'expired' || status === 'cancelled') {
					if (!cancelledPoll) setPhase('failed');
					return;
				}
				if (pollCount.current >= MAX_POLLS) {
					if (!cancelledPoll) setPhase('pending');
					return;
				}
				timerId = window.setTimeout(poll, POLL_MS);
			} catch (err) {
				if (!cancelledPoll) {
					setError(getApiErrorMessage(err, t));
					setPhase('error');
				}
			}
		};

		void poll();

		return () => {
			cancelledPoll = true;
			if (timerId) window.clearTimeout(timerId);
		};
	}, [user, checkoutId, cancelled, refreshUser, t]);

	return (
		<Layout
			userName={headerName}
			streakDays={mockStreak.days}
			mainInnerClassName="membership-page"
		>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.membership'), to: '/membership' },
					{ label: t('membershipCheckoutReturn.title') },
				]}
			/>

			<section className="membership-checkout profile-card profile-card--hero">
				<span className="profile-card-tape" aria-hidden />
				<h1 className="membership-title profile-section-title">
					{t('membershipCheckoutReturn.title')}
				</h1>
			</section>

			{phase === 'polling' ? (
				<p className="membership-checkout-status">
					{t('membershipCheckoutReturn.verifying')}
				</p>
			) : null}

			{phase === 'success' ? (
				<div className="membership-checkout-success" role="status">
					<p className="membership-checkout-success-title">
						{t('membershipCheckout.successTitle')}
					</p>
					<p>{t('membershipCheckoutReturn.successDesc')}</p>
					<Link className="membership-history-link" to="/membership">
						{t('membershipCheckoutReturn.backMembership')}
					</Link>
				</div>
			) : null}

			{phase === 'pending' ? (
				<div className="membership-checkout-card profile-card">
					<p>{t('membershipCheckoutReturn.pending')}</p>
					<Link className="membership-history-link" to="/membership/history">
						{t('membershipPage.paymentHistoryLink')}
					</Link>
				</div>
			) : null}

			{phase === 'cancelled' ? (
				<div className="membership-checkout-card profile-card">
					<p>{t('membershipCheckoutReturn.cancelled')}</p>
					<Link className="membership-checkout-back" to="/membership">
						{t('membershipCheckout.back')}
					</Link>
				</div>
			) : null}

			{phase === 'failed' ? (
				<div className="membership-checkout-card profile-card">
					<p>{t('membershipCheckoutReturn.failed')}</p>
					<Link className="membership-checkout-back" to="/membership">
						{t('membershipCheckout.back')}
					</Link>
				</div>
			) : null}

			{phase === 'error' ? (
				<p className="membership-checkout-error" role="alert">
					{error || t('membershipCheckoutReturn.invalidSession')}
				</p>
			) : null}
		</Layout>
	);
}
