import PropTypes from 'prop-types';
import ExamPassageText from './ExamPassageText.jsx';

/** Xem trước markup ngay dưới ô nhập — passage, câu hỏi, lựa chọn… */
export default function ExamMarkupPreview({
	text = '',
	mode = 'preview',
	label,
	compact = false,
	lang,
	inline = false,
}) {
	const value = String(text ?? '').trim();
	if (!value) return null;

	return (
		<div
			className={`exam-markup-preview${compact ? ' exam-markup-preview--compact' : ''}${inline ? ' exam-markup-preview--inline' : ''}`}
		>
			{label ? <span className="exam-markup-preview-label">{label}</span> : null}
			<ExamPassageText
				text={value}
				mode={mode}
				as={inline ? 'span' : 'div'}
				lang={lang}
				className={inline ? 'exam-passage-inline' : undefined}
			/>
		</div>
	);
}

ExamMarkupPreview.propTypes = {
	text: PropTypes.string,
	mode: PropTypes.oneOf(['preview', 'exam']),
	label: PropTypes.string,
	compact: PropTypes.bool,
	lang: PropTypes.string,
	inline: PropTypes.bool,
};
