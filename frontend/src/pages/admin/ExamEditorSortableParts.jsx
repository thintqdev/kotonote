import { useCallback, useState } from 'react';
import { countSectionQuestions } from '../../constants/examPaperStructure.js';
import ExamMediaZoomImage from '../../components/exam/ExamMediaZoomImage.jsx';
import ExamPassageText from '../../components/exam/ExamPassageText.jsx';
import ExamStarQuestionPrompt from '../../components/exam/ExamStarQuestionPrompt.jsx';
import {
	getReadingPassageBlocks,
	resolveBlockImageUrl,
} from '../../utils/examReadingPassages.js';
import { isStarQuestion } from '../../utils/examStarQuestion.js';
import { useListDragReorder } from '../../hooks/useListDragReorder.js';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import '../../components/exam/ExamPassageText.css';

const QUESTION_PREVIEW_LIMIT = 3;

function getQuestionDisplayNumber(question, index) {
	const n = Number(question?.questionNumber);
	return Number.isFinite(n) && n > 0 ? n : index + 1;
}

function getAnswerIndex(question) {
	return Math.min(3, Math.max(0, Number(question?.answerIndex) || 0));
}

function resolveQuestionMediaUrl(question) {
	return String(question?.mediaUrl ?? question?.imageUrl ?? '').trim();
}

function QuestionPreviewItem({ question, partType, index }) {
	const qNum = getQuestionDisplayNumber(question, index);
	const answerIndex = getAnswerIndex(question);
	const text = question.questionJa || question.questionVi || '—';
	const questionMediaUrl = resolveQuestionMediaUrl(question);
	const questionMediaSrc = questionMediaUrl
		? resolvePublicMediaUrl(questionMediaUrl)
		: null;

	return (
		<li className="exam-q-preview-item">
			<div className="exam-q-preview-head">
				<span className="exam-q-preview-num">Câu {qNum}</span>
				{isStarQuestion(question) ? (
					<ExamStarQuestionPrompt
						text={text}
						className="exam-star-q-preview exam-passage-inline exam-q-preview-text"
					/>
				) : (
					<ExamPassageText
						text={text}
						mode="preview"
						as="span"
						className="exam-passage-inline exam-q-preview-text"
						lang={question.questionJa ? 'ja' : undefined}
					/>
				)}
			</div>
			{questionMediaSrc ? (
				<div className="exam-editor-q-media-preview">
					<p className="exam-passage-preview-col-title">Ảnh minh họa</p>
					<ExamMediaZoomImage
						src={questionMediaSrc}
						alt={`Minh họa câu ${qNum}`}
						className="exam-editor-q-media-img"
					/>
				</div>
			) : null}
			{Array.isArray(question.choices) && question.choices.some((c) => String(c ?? '').trim()) ? (
				<div className="exam-q-choice-previews">
					{question.choices.map((choice, ci) =>
						String(choice ?? '').trim() ? (
							<div
								key={`${partType}-q-${index}-c-${ci}`}
								className={`exam-q-choice-preview-row${ci === answerIndex ? ' exam-q-choice-preview-row--correct' : ''}`}
								title={ci === answerIndex ? 'Đáp án đúng' : undefined}
							>
								<span
									className={`exam-q-choice-preview-num${ci === answerIndex ? ' exam-q-choice-preview-num--correct' : ''}`}
									aria-label={ci === answerIndex ? 'Đáp án đúng' : undefined}
								>
									{ci + 1}
								</span>
								<ExamPassageText
									text={choice}
									mode="preview"
									as="span"
									className="exam-passage-inline"
									lang="ja"
								/>
							</div>
						) : null,
					)}
				</div>
			) : null}
		</li>
	);
}

function ExamPartQuestionPreview({ part, partType, questions: questionsProp }) {
	const [expanded, setExpanded] = useState(false);
	const questions = questionsProp ?? part.questions ?? [];
	const qCount = questions.length;
	const hasMore = qCount > QUESTION_PREVIEW_LIMIT;
	const entries = questions.map((q, i) => ({ q, i }));
	const visibleEntries = expanded ? entries : entries.slice(0, QUESTION_PREVIEW_LIMIT);
	const hiddenCount = qCount - QUESTION_PREVIEW_LIMIT;

	return (
		<div className="exam-editor-question-preview">
			<ul>
				{visibleEntries.map(({ q, i }) => (
					<QuestionPreviewItem
						key={`${partType}-q-${i}-${q.questionNumber ?? i}`}
						question={q}
						partType={partType}
						index={i}
					/>
				))}
				{hasMore ? (
					<li className="exam-preview-more-row">
						<button
							type="button"
							className="exam-preview-toggle"
							onClick={() => setExpanded((v) => !v)}
							aria-expanded={expanded}
						>
							{expanded ? 'Thu gọn' : `+${hiddenCount} câu — xem tất cả (${qCount})`}
						</button>
					</li>
				) : null}
			</ul>
		</div>
	);
}

function ExamPartReadingPreview({ part, partType }) {
	const blocks = getReadingPassageBlocks(part).map((block) => ({
		...block,
		questions: [...(block.questions ?? [])],
	}));
	const blockQuestionTotal = blocks.reduce(
		(n, b) => n + (b.questions?.length ?? 0),
		0,
	);
	const flatQuestions = part.questions ?? [];
	if (blockQuestionTotal === 0 && flatQuestions.length > 0 && blocks.length === 1) {
		blocks[0].questions = flatQuestions;
	}

	return (
		<div className="exam-editor-reading-passages">
			{blocks.map((block, bi) => {
				const blockQuestions = block.questions ?? [];
				const hasPassage = Boolean(block.passageJa);
				const blockImageUrl = resolveBlockImageUrl(block);
				const blockAudioUrl = block.audioUrl
					? resolvePublicMediaUrl(block.audioUrl)
					: null;
				const mediaSrc = blockImageUrl
					? resolvePublicMediaUrl(blockImageUrl)
					: null;
				const hasQuestions = blockQuestions.length > 0;
				if (!hasPassage && !hasQuestions && !mediaSrc && !blockAudioUrl) {
					return null;
				}

				return (
					<div
						key={`${partType}-block-${bi}`}
						className={`exam-editor-reading-block${bi > 0 ? ' exam-reading-block--spaced' : ''}`}
					>
						{hasPassage ? (
							<div className="exam-editor-part-passage-preview">
								<p className="exam-passage-preview-col-title">
									{blocks.length > 1 ? `Đoạn ${bi + 1}` : 'Đoạn văn'}
								</p>
								<ExamPassageText text={block.passageJa} mode="preview" />
							</div>
						) : null}
						{blockAudioUrl ? (
							<div className="exam-editor-part-media-preview">
								<p className="exam-passage-preview-col-title">
									{blocks.length > 1 ? `Audio ${bi + 1}` : 'Audio'}
								</p>
								<audio controls preload="metadata" src={blockAudioUrl} />
							</div>
						) : null}
						{mediaSrc ? (
							<div className="exam-editor-part-media-preview">
								<p className="exam-passage-preview-col-title">
									{blocks.length > 1 ? `Ảnh tài liệu ${bi + 1}` : 'Ảnh tài liệu'}
								</p>
								<ExamMediaZoomImage src={mediaSrc} alt="Tài liệu đề thi" />
							</div>
						) : null}
						{hasQuestions ? (
							<ExamPartQuestionPreview
								part={part}
								partType={`${partType}-b${bi}`}
								questions={blockQuestions}
							/>
						) : null}
					</div>
				);
			})}
			{blockQuestionTotal === 0 && flatQuestions.length > 0 && blocks.length > 1 ? (
				<div className="exam-editor-reading-block exam-reading-block--spaced">
					<ExamPartQuestionPreview
						part={part}
						partType={`${partType}-flat`}
						questions={flatQuestions}
					/>
				</div>
			) : null}
		</div>
	);
}

/**
 * Danh sách part có thể kéo thả trong một tab khối JLPT.
 */
export default function ExamEditorSortableParts({
	parts,
	partMeta,
	onReorder,
	onEdit,
	reordering = false,
}) {
	const handleReorder = useCallback(
		(fromIndex, toIndex) => {
			onReorder(fromIndex, toIndex);
		},
		[onReorder],
	);

	const { createDragHandleProps, createRowProps } =
		useListDragReorder(handleReorder);

	return (
		<div className="exam-editor-parts">
			{parts.map((part, index) => {
				const meta = partMeta[part.partType] ?? {};
				const qCount = countSectionQuestions(part);
				const titleVi = part.titleVi || meta.titleVi || part.partType;
				const titleJa = part.titleJa || meta.titleJa || '';
				const isReading = part.sectionType === 'reading';
				const isListening = part.sectionType === 'listening';
				const usesPassageBlocks = isReading;
				const readingBlocks = usesPassageBlocks ? getReadingPassageBlocks(part) : [];
				const readingPassageCount = readingBlocks.filter((b) => b.passageJa).length;
				const readingAudioCount = readingBlocks.filter((b) => b.audioUrl).length;
				const readingImageCount = readingBlocks.filter(
					(b) => resolveBlockImageUrl(b),
				).length;
				const listeningImageCount = isListening
					? (part.questions ?? []).filter((q) => resolveQuestionMediaUrl(q)).length
					: 0;
				const rowProps = createRowProps(index);
				const handleProps = createDragHandleProps(index);

				return (
					<article
						key={`${part.sectionType}-${part.partType}`}
						className={`exam-editor-part${rowProps.className ? ` ${rowProps.className}` : ''}`}
						data-dnd-row
						onDragOver={rowProps.onDragOver}
						onDragLeave={rowProps.onDragLeave}
						onDrop={rowProps.onDrop}
					>
						<div className="exam-editor-part-head">
							<button
								type="button"
								className="exam-dnd-handle exam-dnd-handle--card"
								title="Kéo để sắp xếp"
								disabled={reordering}
								{...handleProps}
							>
								<span aria-hidden>⠿</span>
							</button>
							<div className="exam-editor-part-head-text">
								<h3 className="exam-editor-part-title">{titleVi}</h3>
								{titleJa ? (
									<div className="exam-editor-part-title-ja" lang="ja">
										{titleJa}
									</div>
								) : null}
							</div>
							<div className="exam-editor-part-head-actions">
								<span
									className={`exam-editor-part-stat${qCount > 0 ? ' exam-editor-part-stat--has' : ''}`}
								>
									{qCount} câu
								</span>
								<span className="exam-editor-part-order">#{part.order ?? index + 1}</span>
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--primary exam-editor-part-edit"
									onClick={() =>
										onEdit({
											sectionType: part.sectionType,
											partType: part.partType,
										})
									}
									disabled={reordering}
								>
									Soạn
								</button>
							</div>
						</div>
						<div className="exam-editor-part-body">
							{part.descriptionVi ? (
								<p className="exam-editor-part-desc">{part.descriptionVi}</p>
							) : null}
							<div className="exam-editor-part-stats">
								<span className="exam-editor-part-stat">
									<code>{part.partType}</code>
								</span>
								{usesPassageBlocks ? (
									readingPassageCount > 0 ? (
										<span className="exam-editor-part-stat exam-editor-part-stat--ok">
											{readingPassageCount > 1
												? `${readingPassageCount} đoạn văn`
												: 'Đoạn văn'}
										</span>
									) : null
								) : part.passageJa ? (
									<span className="exam-editor-part-stat exam-editor-part-stat--ok">
										Đoạn văn
									</span>
								) : null}
								{part.audioUrl && !isListening ? (
									<span className="exam-editor-part-stat exam-editor-part-stat--ok">
										Media
									</span>
								) : null}
								{usesPassageBlocks && readingAudioCount > 0 ? (
									<span className="exam-editor-part-stat exam-editor-part-stat--ok">
										{readingAudioCount > 1
											? `${readingAudioCount} audio`
											: 'Audio'}
									</span>
								) : null}
								{usesPassageBlocks && readingImageCount > 0 ? (
									<span className="exam-editor-part-stat exam-editor-part-stat--ok">
										{readingImageCount > 1 ? `${readingImageCount} ảnh` : 'Ảnh tài liệu'}
									</span>
								) : null}
								{isListening && listeningImageCount > 0 ? (
									<span className="exam-editor-part-stat exam-editor-part-stat--ok">
										{listeningImageCount > 1
											? `${listeningImageCount} ảnh câu hỏi`
											: 'Ảnh câu hỏi'}
									</span>
								) : null}
							</div>
							{usesPassageBlocks ? (
								qCount > 0 ||
								readingPassageCount > 0 ||
								readingAudioCount > 0 ||
								readingImageCount > 0 ? (
									<ExamPartReadingPreview
										part={part}
										partType={part.partType}
									/>
								) : (
									<p className="exam-editor-part-empty">Chưa có câu hỏi</p>
								)
							) : (
								<>
									{part.audioUrl && !isListening ? (
										<div className="exam-editor-part-media-preview">
											<p className="exam-passage-preview-col-title">Audio toàn phần</p>
											<audio
												controls
												preload="metadata"
												src={resolvePublicMediaUrl(part.audioUrl)}
											/>
										</div>
									) : null}
									{part.imageUrl ? (
										<div className="exam-editor-part-media-preview">
											<p className="exam-passage-preview-col-title">Ảnh minh họa</p>
											<ExamMediaZoomImage
												src={resolvePublicMediaUrl(part.imageUrl)}
												alt="Tài liệu đề thi"
											/>
										</div>
									) : null}
									{part.passageJa ? (
										<div className="exam-editor-part-passage-preview">
											<p className="exam-passage-preview-col-title">Đoạn văn</p>
											<ExamPassageText text={part.passageJa} mode="preview" />
										</div>
									) : null}
									{qCount > 0 ? (
										<ExamPartQuestionPreview
											part={part}
											partType={part.partType}
										/>
									) : (
										<p className="exam-editor-part-empty">Chưa có câu hỏi</p>
									)}
								</>
							)}
						</div>
					</article>
				);
			})}
		</div>
	);
}
