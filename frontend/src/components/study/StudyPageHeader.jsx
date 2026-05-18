import PropTypes from 'prop-types';

const DEFAULT_DECO = '/assets/vocabulary/list/header-leaf.png';

/**
 * Header chuẩn (theo Vocabulary list) cho các màn học tập.
 */
export default function StudyPageHeader({
	titleId,
	title,
	subtitle,
	aside = null,
	decoSrc = DEFAULT_DECO,
}) {
	return (
		<header className="vocab-lesson-head">
			<div className="vocab-lesson-head-main">
				<img
					className="vocab-lesson-head-deco"
					src={decoSrc}
					alt=""
					loading="lazy"
					decoding="async"
				/>
				<div>
					<h1 id={titleId} className="vocab-lesson-title">
						{title}
					</h1>
					{subtitle ? (
						<p className="vocab-lesson-sub">{subtitle}</p>
					) : null}
				</div>
			</div>
			{aside}
		</header>
	);
}

StudyPageHeader.propTypes = {
	titleId: PropTypes.string.isRequired,
	title: PropTypes.node.isRequired,
	subtitle: PropTypes.node,
	aside: PropTypes.node,
	decoSrc: PropTypes.string,
};
