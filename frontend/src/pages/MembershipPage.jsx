import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import {
  getMembershipPlans,
  getMyMembership,
} from '../services/membershipService.js';
import { formatVnd } from '../constants/membershipPlans.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './AuthPage.css';
import './Profile.css';
import './DashboardHome.css';
import './Membership.css';

const TIER_ORDER = ['free', 'pro', 'ultra', 'ultimate'];

const MembershipPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split('@')[0] ||
    t('demoProfile.firstName');

  const locale = i18n.language?.startsWith('ja') ? 'ja-JP' : 'vi-VN';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [planRows, mine] = await Promise.all([
          getMembershipPlans(),
          getMyMembership(),
        ]);
        if (!cancelled) {
          setPlans(planRows);
          setMembership(mine ?? user?.membership ?? null);
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
  }, [user?.membership, t]);

  const planById = useMemo(() => {
    const map = new Map();
    for (const p of plans) map.set(p.id, p);
    return map;
  }, [plans]);

  const currentTierId = membership?.tierId ?? user?.membership?.tierId ?? 'free';

  const goCheckout = (tierId, billing) => {
    navigate(
      `/membership/checkout?plan=${encodeURIComponent(tierId)}&billing=${encodeURIComponent(billing)}`,
    );
  };

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      mainInnerClassName="profile-main membership-page"
    >
      <Breadcrumb
        items={[
          { label: t('breadcrumb.home'), to: '/', end: true },
          { label: t('breadcrumb.membership') },
        ]}
      />

      <section className="membership-intro profile-card profile-card--hero">
        <span className="profile-card-tape" aria-hidden />
        <h1 className="membership-title profile-section-title">
          {t('membershipPage.title')}
        </h1>
        <p className="membership-subtitle">{t('membershipPage.subtitle')}</p>
        {currentTierId ? (
          <p className="membership-current-pill">
            {t('membershipPage.currentPlan', {
              plan: t(`membershipPage.tiers.${currentTierId}.name`),
            })}
          </p>
        ) : null}
      </section>

      {error ? (
        <p className="membership-checkout-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="membership-checkout-status">{t('common.loading')}</p>
      ) : (
        <div className="membership-tiers membership-tiers--grid">
          {TIER_ORDER.map((tierId) => {
            const plan = planById.get(tierId);
            const isCurrent = currentTierId === tierId;
            const isFree = tierId === 'free';
            const pricing = plan?.pricing ?? { yearly: 0, lifetime: 0 };
            const jlpt = plan?.jlptLevels ?? [];

            return (
              <article
                key={tierId}
                className={`membership-tier profile-card membership-tier--${tierId}${isCurrent ? ' membership-tier--current' : ''}`}
              >
                {isCurrent ? (
                  <span className="membership-tier-badge">
                    {t('membershipPage.badgeCurrent')}
                  </span>
                ) : null}
                <div className="membership-tier-head">
                  <h2 className="membership-tier-name">
                    {t(`membershipPage.tiers.${tierId}.name`)}
                  </h2>
                  <p className="membership-tier-tagline">
                    {t(`membershipPage.tiers.${tierId}.tagline`)}
                  </p>
                  {isFree ? (
                    <p className="membership-tier-price">
                      {t('membershipPage.priceFree')}
                    </p>
                  ) : null}
                </div>

                <p className="membership-tier-jlpt">
                  {t('membershipPage.jlptUnlock', {
                    levels: jlpt.join(', '),
                  })}
                </p>

                <ul className="membership-tier-list">
                  {(
                    (() => {
                      const raw = t(
                        `membershipPage.tiers.${tierId}.features`,
                        { returnObjects: true },
                      );
                      return Array.isArray(raw) ? raw : [];
                    })()
                  ).map((line) => (
                    <li key={line} className="membership-tier-item">
                      {line}
                    </li>
                  ))}
                </ul>

                {!isFree ? (
                  <div className="membership-tier-prices">
                    <button
                      type="button"
                      className="membership-price-btn"
                      disabled={isCurrent && membership?.billing === 'yearly'}
                      onClick={() => goCheckout(tierId, 'yearly')}
                    >
                      <span className="membership-price-btn-label">
                        {t('membershipPage.billing.yearly')}
                      </span>
                      <span className="membership-price-btn-value">
                        {formatVnd(pricing.yearly, locale)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="membership-price-btn membership-price-btn--lifetime"
                      disabled={
                        isCurrent && membership?.billing === 'lifetime'
                      }
                      onClick={() => goCheckout(tierId, 'lifetime')}
                    >
                      <span className="membership-price-btn-label">
                        {t('membershipPage.billing.lifetime')}
                      </span>
                      <span className="membership-price-btn-value">
                        {formatVnd(pricing.lifetime, locale)}
                      </span>
                    </button>
                  </div>
                ) : (
                  <p className="membership-tier-included">
                    {t('membershipPage.includedFree')}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default MembershipPage;
