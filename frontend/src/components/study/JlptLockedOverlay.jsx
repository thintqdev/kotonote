import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** Overlay nhỏ trên card/bài đã khóa theo JLPT */
export default function JlptLockedOverlay({ level, className = '' }) {
	const { t } = useTranslation();
	return (
		<div className={`jlpt-locked-overlay ${className}`.trim()} aria-hidden={false}>
			<span className="jlpt-locked-overlay-badge">🔒 {level}</span>
			<span className="jlpt-locked-overlay-text">{t('jlptAccess.cardLocked')}</span>
			<Link className="jlpt-locked-overlay-link" to="/membership" onClick={(e) => e.stopPropagation()}>
				{t('jlptAccess.upgradeShort')}
			</Link>
		</div>
	);
}

JlptLockedOverlay.propTypes = {
	level: PropTypes.string.isRequired,
	className: PropTypes.string,
};
