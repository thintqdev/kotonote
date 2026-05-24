import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { EXAM_JLPT_LEVELS } from '../constants/examPaperFieldMeta.js';
import { examSessionLabel } from '../constants/examPaperFieldMeta.js';
import { listExamPapers } from '../services/examPaperService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { resolvePublicMediaUrl } from '../utils/resolveAvatarUrl.js';
import { useJlptAccess } from '../hooks/useJlptAccess.js';
import JlptLockedOverlay from '../components/study/JlptLockedOverlay.jsx';
import '../components/study/JlptLockGate.css';
import './DashboardHome.css';
import './VocabularyPages.css';
import './ReadingListPage.css';
import './ExamPaperPages.css';

function ExamIconClipboard() {
	return (
		<svg
			className="reading-ico"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<path
				d="M9 3h6a1 1 0 011 1v1h2a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2V4a1 1 0 011-1z"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinejoin="round"
			/>
			<path d="M9 6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
		</svg>
	);
}

function ExamIconClock() {
	return (
		<svg
			className="reading-ico"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
			<path
				d="M12 8v5l3 2"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export default function ExamPaperListPage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { isLocked } = useJlptAccess();
	const [searchParams, setSearchParams] = useSearchParams();
	const jlpt = (searchParams.get('jlpt') || '').trim();

	const [items, setItems] = useState([]);
	const [jlptLevels, setJlptLevels] = useState([]);
	const [requestedJlptLocked, setRequestedJlptLocked] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	useEffect(() => {
		if (!user) return undefined;
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError('');
			try {
				const data = await listExamPapers({
					jlpt: jlpt || undefined,
					limit: 50,
				});
				if (cancelled) return;
				setItems(data.items ?? []);
				setJlptLevels(
					data.jlptLevels?.length ? data.jlptLevels : [...EXAM_JLPT_LEVELS],
				);
				setRequestedJlptLocked(Boolean(data.requestedJlptLocked));
			} catch (err) {
				if (!cancelled) setError(getApiErrorMessage(err, t));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user, jlpt, t]);

	const setJlptFilter = (level) => {
		const p = new URLSearchParams(searchParams);
		if (level) p.set('jlpt', level);
		else p.delete('jlpt');
		setSearchParams(p, { replace: true });
	};

	const emptyMessage = useMemo(() => {
		if (requestedJlptLocked && jlpt) {
			return t('examPage.jlptLockedEmpty', { level: jlpt });
		}
		return t('examPage.noResults');
	}, [requestedJlptLocked, jlpt, t]);

	if (loading) {
		return (
			<Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
				<p className="vocab-empty">{t('common.loading')}</p>
			</Layout>
		);
	}

	return (
		<Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.practice') },
				]}
			/>

			<article
				className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
				aria-labelledby="exam-list-title"
			>
				<header className="vocab-lesson-head">
					<div className="vocab-lesson-head-main">
						<img
							className="vocab-lesson-head-deco"
							src="/assets/vocabulary/list/header-leaf.png"
							alt=""
							loading="lazy"
							decoding="async"
						/>
						<div>
							<h1 id="exam-list-title" className="vocab-lesson-title">
								{t('examPage.listTitle')}
							</h1>
							<p className="vocab-lesson-sub">
								<span className="reading-sub-kicker" lang="ja">
									{t('examPage.kickerJa')}
								</span>
								<span className="reading-sub-sep"> · </span>
								<span>{t('examPage.kicker')}</span>
								<span className="reading-sub-sep"> — </span>
								{t('examPage.listSubtitle')}
							</p>
						</div>
					</div>
				</header>

				{error ? (
					<p className="vocab-empty" role="alert">
						{error}
					</p>
				) : null}

				<div
					className="vocab-tabs reading-jlpt-tabs"
					role="tablist"
					aria-label={t('examPage.filterAria')}
				>
					<button
						type="button"
						role="tab"
						aria-selected={!jlpt}
						className={`vocab-tab${!jlpt ? ' vocab-tab--active' : ''}`}
						onClick={() => setJlptFilter('')}
					>
						{t('examPage.filterAll')}
					</button>
					{jlptLevels.map((lv) => (
						<button
							key={lv}
							type="button"
							role="tab"
							aria-selected={jlpt === lv}
							className={`vocab-tab${jlpt === lv ? ' vocab-tab--active' : ''}${isLocked(lv) ? ' vocab-tab--jlpt-locked' : ''}`}
							onClick={() => setJlptFilter(lv)}
						>
							{isLocked(lv) ? t('jlptAccess.tabLocked', { level: lv }) : lv}
						</button>
					))}
				</div>

				{items.length === 0 ? (
					<p className="vocab-empty" role="status">
						{emptyMessage}
					</p>
				) : (
					<ul className="vocab-lesson-list">
						{items.map((item) => {
							const locked = item.locked || isLocked(item.jlpt);
							const jlptSlug = String(item.jlpt || 'n3').toLowerCase();
							const thumbSrc = resolvePublicMediaUrl(item.thumbnailUrl);
							const rowInner = (
								<>
									<div className="reading-thumb-wrap exam-thumb-wrap">
										{thumbSrc ? (
											<img
												className="reading-thumb exam-thumb-img"
												src={thumbSrc}
												alt=""
												loading="lazy"
												decoding="async"
											/>
										) : (
											<div className="exam-thumb-placeholder" aria-hidden>
												<ExamIconClipboard />
											</div>
										)}
									</div>
									<div className="vocab-lesson-main reading-row-main">
										<div className="reading-row-titleline">
											<span
												className={`reading-badge reading-badge--${jlptSlug}`}
												lang="ja"
											>
												{item.jlpt}
											</span>
											<h2 className="vocab-lesson-card-title reading-row-title">
												{item.titleVi}
											</h2>
										</div>
										{item.titleJa ? (
											<p
												className="vocab-lesson-card-sub reading-row-snippet"
												lang="ja"
											>
												{item.titleJa}
											</p>
										) : null}
										<div className="reading-row-meta">
											<span className="reading-meta-item">
												<ExamIconClipboard />
												{t('examPage.metaQuestions', {
													n: item.questionCount ?? 0,
												})}
											</span>
											{item.durationMinutes ? (
												<span className="reading-meta-item">
													<ExamIconClock />
													{t('examPage.metaDuration', {
														min: item.durationMinutes,
													})}
												</span>
											) : null}
											<span className="reading-meta-item reading-meta-item--type">
												{item.year} · {examSessionLabel(item.session)}
											</span>
										</div>
										<span className="reading-row-cta vocab-cta-btn reading-cta--not_started">
											{t('examPage.ctaStart')}
										</span>
									</div>
									{!locked ? (
										<span className="vocab-lesson-chevron" aria-hidden>
											›
										</span>
									) : null}
								</>
							);

							if (locked) {
								return (
									<li
										key={item.slug || item._id}
										className="reading-card-wrap--locked vocab-lesson-card"
									>
										<div className="reading-row-link reading-card--jlpt-locked">
											{rowInner}
										</div>
										<JlptLockedOverlay level={item.jlpt} />
									</li>
								);
							}

							return (
								<li key={item.slug || item._id} className="vocab-lesson-card">
									<Link
										className="reading-row-link"
										to={`/practice/${item.slug}`}
									>
										{rowInner}
									</Link>
								</li>
							);
						})}
					</ul>
				)}
			</article>
		</Layout>
	);
}
