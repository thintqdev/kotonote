import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './JlptLockGate.css';

/**
 * Chặn bài từ vựng chưa đủ điều kiện growth (quiz → Nảy mầm).
 */
export default function VocabLessonUnlockGate({
	reasonKey,
	lessonNo,
	jlpt,
	children,
}) {
	const { t } = useTranslation();

	if (!reasonKey) {
		return children;
	}

	return (
		<div className="jlpt-lock-gate" role="region" aria-labelledby="vocab-unlock-title">
			<div className="jlpt-lock-gate-inner profile-card">
				<span className="jlpt-lock-gate-icon" aria-hidden>
					🌱
				</span>
				<h2 id="vocab-unlock-title" className="jlpt-lock-gate-title">
					{t('vocabPage.unlockGateTitle', { n: lessonNo })}
				</h2>
				<p className="jlpt-lock-gate-desc">{t(reasonKey)}</p>
				<Link
					className="btn-primary jlpt-lock-gate-cta"
					to={jlpt ? `/vocabulary/browse?jlpt=${encodeURIComponent(jlpt)}` : '/vocabulary/browse'}
				>
					{t('vocabPage.unlockGateBack')}
				</Link>
			</div>
		</div>
	);
}

VocabLessonUnlockGate.propTypes = {
	reasonKey: PropTypes.string,
	lessonNo: PropTypes.number,
	jlpt: PropTypes.string,
	children: PropTypes.node,
};
