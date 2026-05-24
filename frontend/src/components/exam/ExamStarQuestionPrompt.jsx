import PropTypes from 'prop-types';

/** Hiển thị câu ★問題 dạng plain text: あした ____ ★ ____ ____ 。 */
export default function ExamStarQuestionPrompt({ text = '', className = '' }) {
	return (
		<p className={`exam-star-q-line${className ? ` ${className}` : ''}`} lang="ja">
			{text}
		</p>
	);
}

ExamStarQuestionPrompt.propTypes = {
	text: PropTypes.string,
	className: PropTypes.string,
};
