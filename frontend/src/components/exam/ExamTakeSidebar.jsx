import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { EXAM_SECTION_META } from '../../constants/examPaperStructure.js';

function formatTime(totalSeconds) {
	const sec = Math.max(0, Math.floor(totalSeconds));
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

function useExamTimer(durationMinutes, paused) {
	const totalSec = Math.max(0, Number(durationMinutes) || 0) * 60;
	const hasLimit = totalSec > 0;
	const [remaining, setRemaining] = useState(totalSec);
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		if (paused) return undefined;
		const id = window.setInterval(() => {
			if (hasLimit) {
				setRemaining((r) => Math.max(0, r - 1));
			} else {
				setElapsed((e) => e + 1);
			}
		}, 1000);
		return () => window.clearInterval(id);
	}, [hasLimit, paused]);

	useEffect(() => {
		if (hasLimit) setRemaining(totalSec);
		else setElapsed(0);
	}, [totalSec, hasLimit]);

	return {
		hasLimit,
		remaining,
		elapsed,
		isExpired: hasLimit && remaining <= 0,
		display: hasLimit ? formatTime(remaining) : formatTime(elapsed),
	};
}

/**
 * Thanh sticky: đồng hồ + phiếu trả lời theo tab section đang mở.
 */
export default function ExamTakeSidebar({
	durationMinutes = 0,
	paused = false,
	questionGroups = [],
	answers = {},
	showResult = false,
	resultByKey = {},
	activeSection,
	onJumpToQuestion,
}) {
	const { t } = useTranslation();
	const timer = useExamTimer(durationMinutes, paused);

	const activeGroup = useMemo(
		() => questionGroups.find((g) => g.sectionType === activeSection) ?? null,
		[questionGroups, activeSection],
	);

	const activeSectionMeta = EXAM_SECTION_META[activeSection] ?? {};

	const answeredInSection = useMemo(() => {
		if (!activeGroup) return 0;
		return activeGroup.items.filter(
			(item) => typeof answers[item.key] === 'number',
		).length;
	}, [activeGroup, answers]);

	const questionTotalInSection = activeGroup?.items.length ?? 0;

	return (
		<aside className="exam-take-sidebar" aria-label={t('examPage.sidebarAria')}>
			<div className="exam-take-sidebar-panel">
				<div
					className={`exam-take-timer${timer.isExpired ? ' exam-take-timer--expired' : ''}${timer.hasLimit && timer.remaining <= 300 && timer.remaining > 0 ? ' exam-take-timer--warn' : ''}`}
				>
					<span className="exam-take-timer-label">{t('examPage.timerLabel')}</span>
					<strong className="exam-take-timer-value" aria-live="polite">
						{timer.isExpired ? t('examPage.timeUp') : timer.display}
					</strong>
					{timer.hasLimit ? (
						<span className="exam-take-timer-hint">
							{t('examPage.metaDuration', { min: durationMinutes })}
						</span>
					) : (
						<span className="exam-take-timer-hint">{t('examPage.timerOpen')}</span>
					)}
				</div>

				<div className="exam-take-sheet-head">
					<h2 className="exam-take-sheet-title">
						{t('examPage.answerSheetTitle')}
						{activeSectionMeta.titleVi ? (
							<span className="exam-take-sheet-section-label">
								{' '}
								· {activeSectionMeta.titleVi}
							</span>
						) : null}
					</h2>
					<span className="exam-take-sheet-count">
						{t('examPage.answeredCount', {
							n: answeredInSection,
							total: questionTotalInSection,
						})}
					</span>
				</div>

				<div className="exam-take-sheet-body">
					{activeGroup ? (
						<section className="exam-take-sheet-section exam-take-sheet-section--active">
							<div className="exam-take-sheet-grid" role="group">
								{activeGroup.items.map((item) => {
									const picked = answers[item.key];
									const hasAnswer = typeof picked === 'number';
									const result = resultByKey[item.key];
									let cellClass = 'exam-take-sheet-cell';
									if (showResult && result) {
										cellClass += result.isCorrect
											? ' exam-take-sheet-cell--ok'
											: ' exam-take-sheet-cell--bad';
									} else if (hasAnswer) {
										cellClass += ' exam-take-sheet-cell--filled';
									}

									return (
										<button
											key={item.key}
											type="button"
											className={cellClass}
											onClick={() => onJumpToQuestion?.(item)}
											title={
												hasAnswer && !showResult
													? t('examPage.sheetChoice', { n: picked + 1 })
													: undefined
											}
										>
											<span className="exam-take-sheet-cell-num">
												{item.questionNumber}
											</span>
											{hasAnswer ? (
												<span className="exam-take-sheet-cell-pick">
													{picked + 1}
												</span>
											) : (
												<span className="exam-take-sheet-cell-empty" aria-hidden>
													—
												</span>
											)}
										</button>
									);
								})}
							</div>
						</section>
					) : (
						<p className="exam-take-sheet-empty">{t('examPage.emptySection')}</p>
					)}
				</div>
			</div>
		</aside>
	);
}

ExamTakeSidebar.propTypes = {
	durationMinutes: PropTypes.number,
	paused: PropTypes.bool,
	questionGroups: PropTypes.arrayOf(
		PropTypes.shape({
			sectionType: PropTypes.string.isRequired,
			items: PropTypes.array.isRequired,
		}),
	),
	answers: PropTypes.object,
	showResult: PropTypes.bool,
	resultByKey: PropTypes.object,
	activeSection: PropTypes.string,
	onJumpToQuestion: PropTypes.func,
};
