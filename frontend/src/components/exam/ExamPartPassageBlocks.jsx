import PropTypes from 'prop-types';
import ExamMediaZoomImage from './ExamMediaZoomImage.jsx';
import ExamPassageText from './ExamPassageText.jsx';
import ExamTakeQuestion from './ExamTakeQuestion.jsx';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import { buildExamAnswerKey, examQuestionDomId } from '../../utils/examTakeHelpers.js';
import {
	getReadingPassageBlocks,
	resolveBlockImageUrl,
} from '../../utils/examReadingPassages.js';

/**
 * Hiển thị các block đoạn văn + câu hỏi (đọc hiểu nhiều đoạn hoặc legacy 1 đoạn).
 */
export default function ExamPartPassageBlocks({
	part,
	answers,
	onPick,
	showResult = false,
	resultByKey = {},
	passageMode = 'exam',
}) {
	const blocks = getReadingPassageBlocks(part);

	return blocks.map((block, bi) => {
		const mediaUrl = block.audioUrl || resolveBlockImageUrl(block);
		const mediaSrc = mediaUrl ? resolvePublicMediaUrl(mediaUrl) : null;
		const isAudio = Boolean(block.audioUrl);

		return (
			<div
				key={`${part.sectionType}-${part.partType}-block-${bi}`}
				className={`exam-reading-block${bi > 0 ? ' exam-reading-block--spaced' : ''}`}
			>
				{block.passageJa ? (
					<div className="grammar-box exam-passage-box">
						<ExamPassageText text={block.passageJa} mode={passageMode} />
					</div>
				) : null}

				{mediaSrc ? (
					<div className="grammar-box exam-media-box">
						{isAudio ? (
							<audio controls preload="metadata" src={mediaSrc} />
						) : (
							<ExamMediaZoomImage src={mediaSrc} alt="Tài liệu đề thi" />
						)}
					</div>
				) : null}

				{(block.questions ?? []).map((q, qi) => {
					const qNum = q.questionNumber ?? qi + 1;
					const key = buildExamAnswerKey(part.sectionType, part.partType, qNum);
					return (
						<ExamTakeQuestion
							key={key}
							scrollId={examQuestionDomId(key)}
							question={{ ...q, questionNumber: qNum }}
							questionKey={key}
							pickedIndex={answers?.[key]}
							onPick={onPick ? (ci) => onPick(key, ci) : undefined}
							showResult={showResult}
							result={resultByKey[key]}
						/>
					);
				})}
			</div>
		);
	});
}

ExamPartPassageBlocks.propTypes = {
	part: PropTypes.shape({
		sectionType: PropTypes.string,
		partType: PropTypes.string,
		passageJa: PropTypes.string,
		passages: PropTypes.array,
		questions: PropTypes.array,
		audioUrl: PropTypes.string,
		imageUrl: PropTypes.string,
	}).isRequired,
	answers: PropTypes.object,
	onPick: PropTypes.func,
	showResult: PropTypes.bool,
	resultByKey: PropTypes.object,
	passageMode: PropTypes.oneOf(['exam', 'preview']),
};
