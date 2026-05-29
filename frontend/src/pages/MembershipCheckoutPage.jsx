import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import {
  confirmMembershipCheckout,
  getMembershipCheckoutStatus,
} from '../services/membershipService.js';
import { formatVnd } from '../constants/membershipPlans.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './AuthPage.css';
import './Profile.css';
import './DashboardHome.css';
import './Membership.css';

const VALID_TIERS = new Set(['pro', 'ultra', 'ultimate']);
const VALID_BILLING = new Set(['yearly', 'lifetime']);

function checkoutIdFromRecord(record) {
  if (!record) return '';
  return record.checkoutId ?? record.id ?? '';
}

const MembershipCheckoutPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();

  const checkoutId = searchParams.get('checkoutId') || '';
  const tierId = searchParams.get('plan') || '';
  const billing = searchParams.get('billing') || '';
  const stateCheckout = location.state?.checkout ?? null;

  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split('@')[0] ||
    t('demoProfile.firstName');

  const locale = i18n.language?.startsWith('ja') ? 'ja-JP' : 'vi-VN';

  const isPayosCheckout =
    checkout?.provider === 'payos' && Boolean(checkout?.paymentUrl);
  const isMockCheckout =
    checkout?.provider === 'mock' || (!checkout?.provider && !isPayosCheckout);

  useEffect(() => {
    if (!checkoutId) {
      setError(t('membershipCheckout.missingSession'));
      setLoading(false);
      return undefined;
    }

    if (
      stateCheckout &&
      checkoutIdFromRecord(stateCheckout) === checkoutId
    ) {
      setCheckout(stateCheckout);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMembershipCheckoutStatus(checkoutId);
        if (!cancelled) {
          setCheckout(data.checkout ?? null);
          if (data.checkout?.status === 'paid') {
            setSuccess(true);
          }
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, t));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutId, stateCheckout, t]);

  const handlePayWithPayos = useCallback(() => {
    if (!checkout?.paymentUrl) return;
    window.location.assign(checkout.paymentUrl);
  }, [checkout]);

  const handleSimulatePay = useCallback(async () => {
    if (!checkoutId) return;
    setPaying(true);
    setError('');
    try {
      await confirmMembershipCheckout(checkoutId);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate('/membership', { replace: true }), 2200);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setPaying(false);
    }
  }, [checkoutId, refreshUser, navigate, t]);

  const displayTierId = checkout?.tierId || tierId;
  const displayBilling = checkout?.billing || billing;
  const paramsValid =
    VALID_TIERS.has(displayTierId) && VALID_BILLING.has(displayBilling);

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
          { label: t('membershipCheckout.title') },
        ]}
      />

      <section className="membership-checkout profile-card profile-card--hero">
        <span className="profile-card-tape" aria-hidden />
        <h1 className="membership-title profile-section-title">
          {t('membershipCheckout.title')}
        </h1>
        <p className="membership-subtitle">
          {t('membershipCheckout.subtitle')}
        </p>
      </section>

      {loading ? (
        <p className="membership-checkout-status">{t('common.loading')}</p>
      ) : null}

      {error ? (
        <p className="membership-checkout-error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !checkoutId ? (
        <Link className="membership-checkout-back" to="/membership">
          {t('membershipCheckout.back')}
        </Link>
      ) : null}

      {success ? (
        <div className="membership-checkout-success" role="status">
          <p className="membership-checkout-success-title">
            {t('membershipCheckout.successTitle')}
          </p>
          <p>{t('membershipCheckout.successDesc')}</p>
        </div>
      ) : null}

      {checkout && !success && !error && paramsValid ? (
        <section className="membership-checkout-card profile-card">
          <span className="profile-card-tape" aria-hidden />
          <dl className="membership-checkout-summary">
            <div className="membership-checkout-row">
              <dt>{t('membershipCheckout.plan')}</dt>
              <dd>{t(`membershipPage.tiers.${displayTierId}.name`)}</dd>
            </div>
            <div className="membership-checkout-row">
              <dt>{t('membershipCheckout.billing')}</dt>
              <dd>{t(`membershipPage.billing.${displayBilling}`)}</dd>
            </div>
            <div className="membership-checkout-row membership-checkout-row--total">
              <dt>{t('membershipCheckout.total')}</dt>
              <dd>{formatVnd(checkout.amountVnd, locale)}</dd>
            </div>
          </dl>

          {isPayosCheckout ? (
            <p className="membership-checkout-mock-note">
              {t('membershipCheckout.payosNote')}
            </p>
          ) : null}
          {isMockCheckout ? (
            <p className="membership-checkout-mock-note">
              {t('membershipCheckout.mockNote')}
            </p>
          ) : null}

          <div className="membership-checkout-actions">
            {isPayosCheckout ? (
              <button
                type="button"
                className="btn-primary btn-login membership-tier-cta"
                onClick={handlePayWithPayos}
              >
                <span className="btn-primary-line1">
                  <span className="btn-primary-main">
                    {t('membershipCheckout.payWithPayos')}
                  </span>
                  <span className="btn-arrow">→</span>
                </span>
              </button>
            ) : null}
            {isMockCheckout && checkout.status === 'pending' ? (
              <button
                type="button"
                className="btn-primary btn-login membership-tier-cta"
                onClick={handleSimulatePay}
                disabled={paying}
              >
                <span className="btn-primary-line1">
                  <span className="btn-primary-main">
                    {paying
                      ? t('membershipCheckout.paying')
                      : t('membershipCheckout.paySimulate')}
                  </span>
                  <span className="btn-arrow">→</span>
                </span>
              </button>
            ) : null}
            <Link className="membership-checkout-back" to="/membership">
              {t('membershipCheckout.back')}
            </Link>
          </div>
        </section>
      ) : null}
    </Layout>
  );
};

export default MembershipCheckoutPage;
