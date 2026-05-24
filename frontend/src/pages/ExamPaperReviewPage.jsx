import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import {
	EXAM_PART_META,
	EXAM_SECTION_META,
	countSectionQuestions,
} from '../constants/examPaperStructure.js';
import { examSessionLabel } from '../constants/examPaperFieldMeta.js';
import ExamPassageText from '../components/exam/ExamPassageText.jsx';
import ExamTakeQuestion from '../components/exam/ExamTakeQuestion.jsx';
import ExamPartPassageBlocks from '../components/exam/ExamPartPassageBlocks.jsx';
import ExamListeningAudioPlayer from '../components/exam/ExamListeningAudioPlayer.jsx';
import MembershipFeatureGate from '../components/study/MembershipFeatureGate.jsx';
import { usePaidMembership } from '../hooks/usePaidMembership.js';
import { reviewExamPaper, reviewExamPaperAttempt } from '../services/examPaperService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { isPaidFeatureLockedError } from '../utils/membershipAccess.js';
import { loadExamResult, saveExamResult } from '../utils/examResultStorage.js';
import {
	buildExamAnswerKey,
	buildResultByKey,
	filterPaperSections,
	getExamSectionTabs,
} from '../utils/examTakeHelpers.js';
import { resolveListeningAudioUrl } from '../utils/examListeningHelpers.js';
import { resolvePublicMediaUrl } from '../utils/resolveAvatarUrl.js';
import './DashboardHome.css';
import './GrammarPages.css';
import './VocabularyPages.css';
import './ExamPaperPages.css';
import '../components/exam/ExamPassageText.css';

export default function ExamPaperReviewPage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { slug, attemptId } = useParams();
	const isHistory = Boolean(attemptId);
	const { isPaid, loading: membershipLoading } = usePaidMembership();

	const [stored] = useState(() =>
		isHistory ? loadExamResult(null, attemptId) : loadExamResult(slug),
	);
	const [answers, setAnswers] = useState(stored?.answers ?? null);
	const paperMeta = stored?.paper ?? null;

	const [paper, setPaper] = useState(null);
	const [reviewResult, setReviewResult] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [activeSection, setActiveSection] = useState('vocabulary');

	useEffect(() => {
		if (!user || membershipLoading) {
			if (!membershipLoading) setLoading(false);
			return undefined;
		}
		if (!isPaid) {
			setLoading(false);
			return undefined;
		}

		let cancelled = false;
		(async () => {
			setLoading(true);
			setError('');
			try {
				let data;
				if (isHistory && attemptId) {
					data = await reviewExamPaperAttempt(attemptId);
					if (!cancelled) {
						setAnswers(data.attempt?.answers ?? {});
						setPaper(data.paper);
						setReviewResult(data.result);
						saveExamResult(
							data.attempt?.slug,
							{
								result: data.result,
								paper: data.paper,
								answers: data.attempt?.answers,
								attemptId,
							},
							attemptId,
						);
					}
				} else if (slug) {
					const ans = answers ?? stored?.answers;
					if (!ans) return;
					data = await reviewExamPaper(slug, ans);
					if (!cancelled) {
						setPaper(data.paper);
						setReviewResult(data.result);
					}
				}
				if (!cancelled && data?.paper) {
					const tabs = getExamSectionTabs(data.paper?.sections);
					setActiveSection(tabs[0] ?? 'vocabulary');
				}
			} catch (err) {
				if (!cancelled) {
					if (isPaidFeatureLockedError(err)) {
						setError(t('membershipFeature.lockDesc'));
					} else {
						setError(getApiErrorMessage(err, t));
					}
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user, slug, attemptId, isHistory, isPaid, membershipLoading, stored, t]);

	const resultByKey = useMemo(
		() => buildResultByKey(reviewResult?.results ?? []),
		[reviewResult?.results],
	);

	const sectionTabs = useMemo(
		() => getExamSectionTabs(paper?.sections),
		[paper?.sections],
	);

	const sectionsForTab = useMemo(
		() => filterPaperSections(paper?.sections, activeSection),
		[paper?.sections, activeSection],
	);

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	if (!slug && !attemptId) return <Navigate to="/practice" replace />;

	if (!answers && !isHistory) {
		return <Navigate to={`/practice/${slug}`} replace />;
	}

	if (isHistory && !answers && !loading) {
		return <Navigate to="/practice/history" replace />;
	}

	const title = paperMeta?.titleVi ?? paper?.titleVi ?? slug;
	const paperSlug = slug ?? paperMeta?.slug ?? paper?.slug;
	const resultPath = isHistory
		? `/practice/history/${attemptId}/result`
		: `/practice/${paperSlug}/result`;

	if (loading && isPaid) {
		return (
			<Layout userName={headerName} streakDays={mockStreak.days}>
				<p className="vocab-empty">{t('common.loading')}</p>
			</Layout>
		);
	}

	const reviewContent = isPaid && paper && reviewResult ? (
		<>
			<nav
				className="vocab-tabs reading-jlpt-tabs exam-section-tabs"
				role="tablist"
				aria-label={t('examPage.sectionTabsAria')}
			>
				{sectionTabs.map((key) => {
					const meta = EXAM_SECTION_META[key] ?? {};
					const count = filterPaperSections(paper.sections, key).reduce(
						(n, s) => n + countSectionQuestions(s),
						0,
					);
					return (
						<button
							key={key}
							type="button"
							role="tab"
							aria-selected={activeSection === key}
							className={`vocab-tab${activeSection === key ? ' vocab-tab--active' : ''}`}
							onClick={() => setActiveSection(key)}
						>
							{meta.titleVi}
							<span className="exam-section-tab-count">{count}</span>
						</button>
					);
				})}
			</nav>

			{sectionsForTab.length === 0 ? (
				<p className="vocab-empty">{t('examPage.emptySection')}</p>
			) : (
				<>
					{activeSection === 'listening' && resolveListeningAudioUrl(paper) ? (
						<div className="exam-listening-section-audio">
							<ExamListeningAudioPlayer
								src={resolvePublicMediaUrl(resolveListeningAudioUrl(paper))}
								label={t('examPage.listeningSectionAudio', {
									defaultValue: 'Audio nghe hiểu',
								})}
							/>
						</div>
					) : null}
					{sectionsForTab.map((part) => {
					const partMeta = EXAM_PART_META[part.partType] ?? {};
					const partTitle = part.titleVi || partMeta.titleVi || part.partType;

					return (
						<section
							key={`${part.sectionType}-${part.partType}`}
							className="grammar-block"
						>
							<h2 className="grammar-h">{partTitle}</h2>
							{partMeta.titleJa ? (
								<p className="grammar-vi-note" lang="ja">
									{partMeta.titleJa}
								</p>
							) : null}

							{part.sectionType === 'reading' ||
							part.sectionType === 'listening' ? (
								<ExamPartPassageBlocks
									part={part}
									answers={answers}
									showResult
									resultByKey={resultByKey}
									passageMode="preview"
								/>
							) : (
								<>
									{part.passageJa ? (
										<div className="grammar-box exam-passage-box">
											<ExamPassageText text={part.passageJa} mode="preview" />
										</div>
									) : null}

									{(part.questions ?? []).map((q, qi) => {
										const qNum = q.questionNumber ?? qi + 1;
										const key = buildExamAnswerKey(
											part.sectionType,
											part.partType,
											qNum,
										);
										const graded = resultByKey[key];
										const pickedIndex =
											typeof graded?.pickedIndex === 'number'
												? graded.pickedIndex
												: typeof answers[key] === 'number'
													? answers[key]
													: undefined;

										return (
											<ExamTakeQuestion
												key={key}
												question={{ ...q, questionNumber: qNum }}
												questionKey={key}
												pickedIndex={pickedIndex}
												showResult
												result={graded}
											/>
										);
									})}
								</>
							)}
						</section>
					);
				})}
				</>
			)}
		</>
	) : null;

	return (
		<Layout userName={headerName} streakDays={mockStreak.days}>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.practice'), to: '/practice' },
					...(isHistory
						? [{ label: t('examPage.historyTitle'), to: '/practice/history' }]
						: []),
					...(paperSlug
						? [
								{
									label: title,
									to: isHistory ? resultPath : `/practice/${paperSlug}`,
								},
							]
						: []),
					{ label: t('examPage.resultTitle'), to: resultPath },
					{ label: t('examPage.reviewTitle') },
				]}
			/>

			<article
				className="grammar-sheet grammar-scope grammar-detail--journal exam-review-sheet"
				aria-labelledby="exam-review-title"
			>
				<Link className="grammar-back" to={resultPath}>
					{t('examPage.backToResult')}
				</Link>

				<header className="grammar-detail-head">
					<p className="grammar-detail-kicker">
						{paperMeta?.jlpt
							? t('grammarPage.jlptBadge', { level: paperMeta.jlpt })
							: null}
						{paperMeta?.jlpt ? ' · ' : ''}
						{t('examPage.reviewTitle')}
					</p>
					<h1 id="exam-review-title" className="grammar-detail-title">
						{title}
					</h1>
					{paperMeta?.titleJa ? (
						<p className="grammar-detail-ribbon" lang="ja">
							{paperMeta.titleJa}
						</p>
					) : paperMeta?.year ? (
						<p className="grammar-detail-ribbon">
							{paperMeta.year} · {examSessionLabel(paperMeta.session)}
						</p>
					) : null}
					<p className="grammar-vi-note">{t('examPage.reviewSubtitle')}</p>
				</header>

				{error ? (
					<p className="vocab-empty" role="alert">
						{error}
					</p>
				) : null}

				<MembershipFeatureGate>{reviewContent}</MembershipFeatureGate>

				<section className="grammar-block exam-submit-block">
					<div className="exam-submit-actions">
						<Link to={resultPath} className="vocab-cta-btn vocab-cta-btn--muted">
							{t('examPage.backToResult')}
						</Link>
						<Link to={`/practice/${paperSlug}`} className="vocab-cta-btn vocab-cta-btn--muted">
							{t('examPage.retry')}
						</Link>
					</div>
				</section>
			</article>
		</Layout>
	);
}
