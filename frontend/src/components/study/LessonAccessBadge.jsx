import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Badge trạng thái mở/khóa bài — luôn nhìn thấy trên card danh sách.
 * @param {'open'|'growthLocked'|'jlptLocked'} variant
 */
export default function LessonAccessBadge({ variant, jlpt }) {
	const { t } = useTranslation();

	if (variant === 'open') {
		return (
			<span className="vocab-lesson-status-badge vocab-lesson-status-badge--open">
				{t('vocabPage.badgeOpen')}
			</span>
		);
	}

	if (variant === 'jlptLocked') {
		return (
			<Link
				to="/membership"
				className="vocab-lesson-status-badge vocab-lesson-status-badge--jlpt"
				onClick={(e) => e.stopPropagation()}
			>
				<span className="vocab-lesson-status-badge-ico" aria-hidden>
					🔒
				</span>
				{t('vocabPage.badgeJlptLocked', { level: jlpt || '' })}
			</Link>
		);
	}

	return (
		<span className="vocab-lesson-status-badge vocab-lesson-status-badge--growth">
			<span className="vocab-lesson-status-badge-ico" aria-hidden>
				🔒
			</span>
			{t('vocabPage.badgeGrowthLocked')}
		</span>
	);
}

LessonAccessBadge.propTypes = {
	variant: PropTypes.oneOf(['open', 'growthLocked', 'jlptLocked']).isRequired,
	jlpt: PropTypes.string,
};
