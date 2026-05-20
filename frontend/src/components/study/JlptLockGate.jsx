import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useJlptAccess } from '../../hooks/useJlptAccess.js';
import { normalizeJlptLevel } from '../../utils/jlptAccess.js';
import './JlptLockGate.css';

/**
 * Chặn nội dung khi JLPT chưa mở — hiển thị paywall tới /membership.
 */
export default function JlptLockGate({
	jlpt,
	forceLocked = false,
	children,
	className = '',
}) {
	const { t } = useTranslation();
	const { isLocked, loading } = useJlptAccess();
	const level = normalizeJlptLevel(jlpt);

	if (loading) return children;

	const shouldLock = forceLocked || (level ? isLocked(level) : false);
	if (!shouldLock) return children;

	const titleLevel = level || 'JLPT';
	const descKey = level ? 'jlptAccess.lockDesc' : 'jlptAccess.lockDescGeneric';

	return (
		<div
			className={`jlpt-lock-gate ${className}`.trim()}
			role="region"
			aria-labelledby="jlpt-lock-title"
		>
			<div className="jlpt-lock-gate-inner profile-card">
				<span className="jlpt-lock-gate-icon" aria-hidden>
					🔒
				</span>
				<h2 id="jlpt-lock-title" className="jlpt-lock-gate-title">
					{level
						? t('jlptAccess.lockTitle', { level })
						: t('jlptAccess.lockTitleGeneric')}
				</h2>
				<p className="jlpt-lock-gate-desc">
					{t(descKey, { level: titleLevel, defaultValue: t('jlptAccess.lockDesc', { level: titleLevel }) })}
				</p>
				<Link className="btn-primary jlpt-lock-gate-cta" to="/membership">
					{t('jlptAccess.upgradeCta')}
				</Link>
			</div>
		</div>
	);
}

JlptLockGate.propTypes = {
	jlpt: PropTypes.string,
	forceLocked: PropTypes.bool,
	children: PropTypes.node,
	className: PropTypes.string,
};
