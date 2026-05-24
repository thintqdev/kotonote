import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { parsePassageMarkup } from '../../utils/examPassageMarkup.js';
import './ExamPassageText.css';

/**
 * Render đoạn văn có markup JLPT.
 * @param {'preview' | 'exam'} mode — exam: ẩn nội dung chỗ *blank*
 */
export default function ExamPassageText({
	text = '',
	mode = 'preview',
	className = '',
	lang = 'ja',
	as: Tag = 'div',
}) {
	const nodes = useMemo(() => parsePassageMarkup(text), [text]);

	return (
		<Tag className={`exam-passage${className ? ` ${className}` : ''}`} lang={lang}>
			{nodes.map((node, idx) => renderNode(node, idx, mode))}
		</Tag>
	);
}

ExamPassageText.propTypes = {
	text: PropTypes.string,
	mode: PropTypes.oneOf(['preview', 'exam']),
	className: PropTypes.string,
	lang: PropTypes.string,
	as: PropTypes.elementType,
};

function renderNode(node, idx, mode) {
	switch (node.type) {
		case 'bold':
			return (
				<strong key={idx} className="exam-passage-bold">
					{node.value}
				</strong>
			);
		case 'underline':
			return (
				<span key={idx} className="exam-passage-underline">
					{node.value}
				</span>
			);
		case 'highlight':
			return (
				<mark key={idx} className="exam-passage-highlight">
					{node.value}
				</mark>
			);
		case 'strike':
			return (
				<s key={idx} className="exam-passage-strike">
					{node.value}
				</s>
			);
		case 'ruby':
			return (
				<ruby key={idx} className="exam-passage-ruby">
					{node.base}
					<rt>{node.ruby}</rt>
				</ruby>
			);
		case 'sup':
			return (
				<sup key={idx} className="exam-passage-sup">
					{node.value}
				</sup>
			);
		case 'sub':
			return (
				<sub key={idx} className="exam-passage-sub">
					{node.value}
				</sub>
			);
		case 'blank':
			return (
				<span
					key={idx}
					className={`exam-passage-blank${mode === 'exam' ? ' exam-passage-blank--exam' : ''}`}
					title={mode === 'preview' ? node.value : undefined}
				>
					{mode === 'exam' ? '（　　）' : node.value || '　　'}
				</span>
			);
		case 'blankNumbered':
			return (
				<span key={idx} className="exam-passage-blank-num">
					<span className="exam-passage-blank-num-badge">({node.num})</span>
					<span className="exam-passage-blank-num-slot" aria-hidden>
						　
					</span>
				</span>
			);
		case 'text':
		default:
			return <span key={idx}>{node.value}</span>;
	}
}
