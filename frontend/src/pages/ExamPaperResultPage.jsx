import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { EXAM_SECTION_META } from '../constants/examPaperStructure.js';
import { examSessionLabel } from '../constants/examPaperFieldMeta.js';
import { getExamPaper, getExamPaperAttempt } from '../services/examPaperService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { loadExamResult, saveExamResult } from '../utils/examResultStorage.js';
import { groupExamResultsBySection } from '../utils/examTakeHelpers.js';
import {
	EXAM_MAX_TOTAL_SCORE,
	buildExamResultFeedback,
	computeExamPointsPerQuestion,
	computeExamScaledScore,
	enrichSectionScoresWithPoints,
	examSectionTitleVi,
	getExamOverallFeedbackKey,
	getExamSectionFeedbackTipKey,
} from '../utils/examScoreHelpers.js';
import './DashboardHome.css';
import './GrammarPages.css';
import './VocabularyPages.css';
import './ExamPaperPages.css';

export default function ExamPaperResultPage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { slug, attemptId } = useParams();
	const location = useLocation();
	const isHistory = Boolean(attemptId);

	const locationPayload = location.state?.examResult ?? null;
	const [stored] = useState(() =>
		isHistory ? loadExamResult(null, attemptId) : loadExamResult(slug),
	);
	const [payload, setPayload] = useState(locationPayload ?? stored);

	const [paper, setPaper] = useState(payload?.paper ?? null);
	const [loading, setLoading] = useState(!payload?.result);
	const [error, setError] = useState('');

	const result = payload?.result ?? null;
	const answers = payload?.answers ?? null;
	const paperSlug = slug ?? paper?.slug ?? payload?.paper?.slug;

	useEffect(() => {
		if (!user || !attemptId) return undefined;
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError('');
			try {
				const data = await getExamPaperAttempt(attemptId);
				if (cancelled) return;
				const next = {
					result: data.result,
					paper: data.paper,
					answers: data.attempt?.answers ?? {},
					attemptId,
				};
				setPayload(next);
				setPaper(next.paper);
				saveExamResult(data.attempt?.slug, next, attemptId);
			} catch (err) {
				if (!cancelled) setError(getApiErrorMessage(err, t));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user, attemptId, t]);

	useEffect(() => {
		if (!user || !paperSlug || isHistory || paper) return undefined;
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const loaded = await getExamPaper(paperSlug);
				if (!cancelled && loaded) {
					setPaper((prev) => ({
						titleVi: loaded.titleVi,
						titleJa: loaded.titleJa,
						jlpt: loaded.jlpt,
						year: loaded.year,
						session: loaded.session,
						slug: paperSlug,
					}));
				}
			} catch (err) {
				if (!cancelled) setError(getApiErrorMessage(err, t));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user, paperSlug, isHistory, paper, t]);

	const sectionScores = useMemo(
		() => groupExamResultsBySection(result?.results ?? []),
		[result?.results],
	);

	const totalQuestions = result?.total ?? 0;
	const correctCount = result?.correct ?? 0;
	const pointsPerQuestion = useMemo(
		() => computeExamPointsPerQuestion(totalQuestions),
		[totalQuestions],
	);
	const scaledScore = useMemo(
		() => computeExamScaledScore(correctCount, totalQuestions),
		[correctCount, totalQuestions],
	);
	const sectionScoresWithPoints = useMemo(
		() => enrichSectionScoresWithPoints(sectionScores, pointsPerQuestion),
		[sectionScores, pointsPerQuestion],
	);
	const feedback = useMemo(
		() => buildExamResultFeedback(sectionScoresWithPoints),
		[sectionScoresWithPoints],
	);
	const overallFeedbackKey = getExamOverallFeedbackKey(scaledScore);

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	if (!slug && !attemptId) return <Navigate to="/practice" replace />;

	if (!result && !loading) {
		if (isHistory) return <Navigate to="/practice/history" replace />;
		return <Navigate to={`/practice/${paperSlug || ''}`} replace />;
	}

	if (loading && !paper) {
		return (
			<Layout userName={headerName} streakDays={mockStreak.days}>
				<p className="vocab-empty">{t('common.loading')}</p>
			</Layout>
		);
	}

	const paperMeta = payload?.paper ?? paper;
	const title = paperMeta?.titleVi ?? paper?.titleVi ?? slug;
	const resolvedSlug = slug ?? paperMeta?.slug ?? paper?.slug;
	const reviewPath = isHistory
		? `/practice/history/${attemptId}/review`
		: `/practice/${resolvedSlug}/review`;
	const retryPath = `/practice/${resolvedSlug}`;

	const renderFeedbackSection = (rows, titleKey, variant) => {
		if (!rows.length) return null;
		return (
			<div className={`exam-result-feedback-block exam-result-feedback-block--${variant}`}>
				<h3 className="exam-result-feedback-block-title">{t(titleKey)}</h3>
				<ul className="exam-result-feedback-list">
					{rows.map((row) => (
						<li key={row.sectionType} className="exam-result-feedback-item">
							<strong>{examSectionTitleVi(row.sectionType)}</strong>
							<span className="exam-result-feedback-score">
								{t('examPage.resultSectionPoints', {
									score: row.scaledScore,
									max: row.scaledMax,
									correct: row.correct,
									total: row.total,
								})}
							</span>
							<p className="exam-result-feedback-tip">
								{t(getExamSectionFeedbackTipKey(row.sectionType))}
							</p>
						</li>
					))}
				</ul>
			</div>
		);
	};

	return (
		<Layout userName={headerName} streakDays={mockStreak.days}>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.practice'), to: '/practice' },
					...(isHistory
						? [{ label: t('examPage.historyTitle'), to: '/practice/history' }]
						: []),
					...(resolvedSlug && !isHistory
						? [{ label: title, to: retryPath }]
						: []),
					{ label: t('examPage.resultTitle') },
				]}
			/>

			{error ? (
				<p className="vocab-empty" role="alert">
					{error}
				</p>
			) : null}

			<article
				className="grammar-sheet grammar-scope grammar-detail--journal exam-result-sheet"
				aria-labelledby="exam-result-title"
			>
				<Link className="grammar-back" to="/practice">
					{t('examPage.backToList')}
				</Link>

				<header className="grammar-detail-head exam-result-head">
					<p className="grammar-detail-kicker">
						{paper?.jlpt ? t('grammarPage.jlptBadge', { level: paper.jlpt }) : null}
						{paper?.jlpt ? ' · ' : ''}
						{t('examPage.resultTitle')}
					</p>
					<h1 id="exam-result-title" className="grammar-detail-title">
						{title}
					</h1>
					{paper?.titleJa ? (
						<p className="grammar-detail-ribbon" lang="ja">
							{paper.titleJa}
						</p>
					) : paper?.year ? (
						<p className="grammar-detail-ribbon">
							{paper.year} · {examSessionLabel(paper.session)}
						</p>
					) : null}

					<div className="exam-result-overall" aria-label={t('examPage.scoreLabel')}>
						<div className="exam-result-overall-ring">
							<strong className="exam-result-overall-pct">
								{t('examPage.scoreOutOf', {
									score: scaledScore,
									max: EXAM_MAX_TOTAL_SCORE,
								})}
							</strong>
							<span className="exam-result-overall-sub">
								{correctCount}/{totalQuestions}
							</span>
						</div>
						<div className="exam-result-overall-meta">
							<span className="exam-result-overall-label">{t('examPage.scoreLabel')}</span>
							<p className="exam-result-overall-desc">
								{t('examPage.scoreScaledSummary', {
									correct: correctCount,
									total: totalQuestions,
									points: pointsPerQuestion,
								})}
							</p>
							<p className="exam-result-overall-comment">{t(overallFeedbackKey)}</p>
						</div>
					</div>
				</header>

				<section className="grammar-block" aria-labelledby="exam-result-sections">
					<h2 id="exam-result-sections" className="grammar-h">
						{t('examPage.sectionScoresTitle')}
					</h2>
					<p className="grammar-vi-note">{t('examPage.sectionScoresHint')}</p>

					<ul className="exam-result-section-list">
						{sectionScoresWithPoints.map((row) => {
							const meta = EXAM_SECTION_META[row.sectionType] ?? {};
							const barPct =
								row.scaledMax > 0
									? Math.round((row.scaledScore / row.scaledMax) * 100)
									: 0;
							return (
								<li key={row.sectionType} className="exam-result-section-card">
									<div className="exam-result-section-head">
										<div>
											<h3 className="exam-result-section-name">{meta.titleVi}</h3>
											{meta.titleJa ? (
												<p className="exam-result-section-ja" lang="ja">
													{meta.titleJa}
												</p>
											) : null}
										</div>
										<strong className="exam-result-section-score">
											{t('examPage.scoreOutOf', {
												score: row.scaledScore,
												max: row.scaledMax,
											})}
										</strong>
									</div>
									<div className="vocab-lesson-progress-track reading-goal-track exam-result-section-track">
										<div
											className="vocab-lesson-progress-fill"
											style={{ width: `${barPct}%` }}
										/>
									</div>
									<span className="exam-result-section-pct">
										{row.correct}/{row.total} {t('examPage.resultQuestionsShort')}
									</span>
								</li>
							);
						})}
					</ul>
				</section>

				<section className="grammar-block" aria-labelledby="exam-result-feedback">
					<h2 id="exam-result-feedback" className="grammar-h">
						{t('examPage.resultFeedbackTitle')}
					</h2>
					<div className="exam-result-feedback-grid">
						{renderFeedbackSection(
							feedback.leverage,
							'examPage.resultLeverageTitle',
							'leverage',
						)}
						{renderFeedbackSection(feedback.good, 'examPage.resultGoodTitle', 'good')}
						{renderFeedbackSection(
							feedback.improve,
							'examPage.resultImproveTitle',
							'improve',
						)}
					</div>
				</section>

				<section className="grammar-block exam-submit-block">
					<div className="exam-submit-actions">
						<Link to={reviewPath} className="vocab-cta-btn">
							{t('examPage.viewReview')}
						</Link>
						<Link to={retryPath} className="vocab-cta-btn vocab-cta-btn--muted">
							{t('examPage.retry')}
						</Link>
						{isHistory ? (
							<Link to="/practice/history" className="vocab-cta-btn vocab-cta-btn--muted">
								{t('examPage.historyTitle')}
							</Link>
						) : (
							<Link to="/practice" className="vocab-cta-btn vocab-cta-btn--muted">
								{t('examPage.backToList')}
							</Link>
						)}
					</div>
				</section>
			</article>
		</Layout>
	);
}
