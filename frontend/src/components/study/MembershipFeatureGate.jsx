import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePaidMembership } from '../../hooks/usePaidMembership.js';
import './JlptLockGate.css';

/**
 * Chặn tính năng dành cho gói trả phí — hiển thị paywall tới /membership.
 */
export default function MembershipFeatureGate({ children, className = '' }) {
	const { t } = useTranslation();
	const { isPaid, loading } = usePaidMembership();

	if (loading) return children;
	if (isPaid) return children;

	return (
		<div
			className={`jlpt-lock-gate ${className}`.trim()}
			role="region"
			aria-labelledby="membership-feature-lock-title"
		>
			<div className="jlpt-lock-gate-inner profile-card">
				<span className="jlpt-lock-gate-icon" aria-hidden>
					🔒
				</span>
				<h2 id="membership-feature-lock-title" className="jlpt-lock-gate-title">
					{t('membershipFeature.lockTitle')}
				</h2>
				<p className="jlpt-lock-gate-desc">{t('membershipFeature.lockDesc')}</p>
				<Link className="btn-primary jlpt-lock-gate-cta" to="/membership">
					{t('jlptAccess.upgradeCta')}
				</Link>
			</div>
		</div>
	);
}

MembershipFeatureGate.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
};
