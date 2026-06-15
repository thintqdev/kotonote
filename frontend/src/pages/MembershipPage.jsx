import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import {
  createMembershipCheckout,
  getMembershipPlans,
  getMyMembership,
} from '../services/membershipService.js';
import {
  formatVnd,
  MEMBERSHIP_TIER_RANK,
  PAID_TIER_IDS,
} from '../constants/membershipPlans.js';
import { jlptUnlockedFromMembership } from '../utils/jlptAccess.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './AuthPage.css';
import './Profile.css';
import './DashboardHome.css';
import './Membership.css';

const TIER_ORDER = ['free', 'pro', 'ultra', 'ultimate'];

function isPaidTier(tierId) {
  return PAID_TIER_IDS.includes(tierId);
}

const MembershipPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoadingKey, setCheckoutLoadingKey] = useState('');

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split('@')[0] ||
    t('demoProfile.firstName');

  const locale = i18n.language?.startsWith('ja') ? 'ja-JP' : 'vi-VN';

  const loadMembershipData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [planRows, mine] = await Promise.all([
        getMembershipPlans(),
        getMyMembership(),
      ]);
      setPlans(planRows);
      setMembership(mine ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const userId = user?.id ?? user?._id;

  useEffect(() => {
    if (!userId) return;
    void loadMembershipData();
  }, [userId, loadMembershipData]);

  const planById = useMemo(() => {
    const map = new Map();
    for (const p of plans) map.set(p.id, p);
    return map;
  }, [plans]);

  const effectiveMembership = membership ?? user?.membership ?? null;
  const currentTierId = effectiveMembership?.tierId ?? 'free';
  const currentRank = MEMBERSHIP_TIER_RANK[currentTierId] ?? 0;
  const unlockedLevels = useMemo(
    () => jlptUnlockedFromMembership(effectiveMembership),
    [effectiveMembership],
  );
  const unlockedLabel = unlockedLevels.join(', ');
  const hasPaidPlan = isPaidTier(currentTierId);

  const heroSubtitle = hasPaidPlan
    ? t('membershipPage.subtitleActive', {
        plan: t(`membershipPage.tiers.${currentTierId}.name`),
        levels: unlockedLabel,
      })
    : t('membershipPage.subtitleFree');

  const goCheckout = async (tierId, billing) => {
    const key = `${tierId}:${billing}`;
    if (checkoutLoadingKey) return;

    setCheckoutLoadingKey(key);
    setError('');
    try {
      const created = await createMembershipCheckout({ tierId, billing });
      const checkoutId = created?.checkoutId ?? created?.id;
      if (!checkoutId) {
        throw new Error('Missing checkout id');
      }
      navigate(
        `/membership/checkout?checkoutId=${encodeURIComponent(checkoutId)}&plan=${encodeURIComponent(tierId)}&billing=${encodeURIComponent(billing)}`,
        { state: { checkout: created } },
      );
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setCheckoutLoadingKey('');
    }
  };

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      mainInnerClassName="membership-page"
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
        <p className="membership-subtitle">{heroSubtitle}</p>
        <div className="membership-intro-pills">
          <p className="membership-current-pill">
            {t('membershipPage.currentPlan', {
              plan: t(`membershipPage.tiers.${currentTierId}.name`),
            })}
          </p>
          <p className="membership-unlocked-pill">
            {t('membershipPage.unlockedJlpt', { levels: unlockedLabel })}
          </p>
        </div>
        <Link className="membership-history-link" to="/membership/history">
          {t('membershipPage.paymentHistoryLink')}
        </Link>
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
            const tierRank = MEMBERSHIP_TIER_RANK[tierId] ?? 0;
            const isCurrent = currentTierId === tierId;
            const isIncluded = tierRank < currentRank;
            const canUpgrade = tierRank > currentRank;
            const isFree = tierId === 'free';
            const pricing = plan?.pricing ?? { yearly: 0, lifetime: 0 };
            const jlpt =
              plan?.jlptLevels?.length > 0
                ? plan.jlptLevels
                : jlptUnlockedFromMembership({ tierId });

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

                {isIncluded ? (
                  <p className="membership-tier-included membership-tier-included--owned">
                    {t('membershipPage.tierIncludedInPlan')}
                  </p>
                ) : null}
                {!isFree && canUpgrade ? (
                  <div className="membership-tier-prices">
                    <button
                      type="button"
                      className="membership-price-btn"
                      disabled={
                        Boolean(checkoutLoadingKey) ||
                        (isCurrent && membership?.billing === 'yearly')
                      }
                      onClick={() => void goCheckout(tierId, 'yearly')}
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
                        Boolean(checkoutLoadingKey) ||
                        (isCurrent && membership?.billing === 'lifetime')
                      }
                      onClick={() => void goCheckout(tierId, 'lifetime')}
                    >
                      <span className="membership-price-btn-label">
                        {t('membershipPage.billing.lifetime')}
                      </span>
                      <span className="membership-price-btn-value">
                        {formatVnd(pricing.lifetime, locale)}
                      </span>
                    </button>
                  </div>
                ) : null}
                {isFree && !hasPaidPlan ? (
                  <p className="membership-tier-included">
                    {t('membershipPage.includedFree')}
                  </p>
                ) : null}
                {isFree && hasPaidPlan ? (
                  <p className="membership-tier-included membership-tier-included--muted">
                    {t('membershipPage.tierCatalogFree')}
                  </p>
                ) : null}
                {!isFree && isCurrent ? (
                  <p className="membership-tier-included membership-tier-included--owned">
                    {t('membershipPage.tierCurrentActive')}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default MembershipPage;
