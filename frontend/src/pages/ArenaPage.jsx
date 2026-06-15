import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import StudyPageHeader from '../components/study/StudyPageHeader.jsx';
import { mockStreak } from '../data/dashboardHomeMock.js';
import {
	beginArenaChallenge,
	getArenaStatus,
	submitArenaChallenge,
} from '../services/arenaService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './DashboardHome.css';
import './GrammarPages.css';
import './VocabularyPages.css';
import './ArenaPages.css';

const KanjiRainGame = lazy(() => import('../components/arena/KanjiRainGame.jsx'));
const VocabBoxGame = lazy(() => import('../components/arena/VocabBoxGame.jsx'));
const ParticleQuizGame = lazy(() => import('../components/arena/ParticleQuizGame.jsx'));
const ReadingRushGame = lazy(() => import('../components/arena/ReadingRushGame.jsx'));
const MeaningRushGame = lazy(() => import('../components/arena/MeaningRushGame.jsx'));

function formatDuration(ms) {
	const totalSec = Math.max(0, Math.floor(Number(ms || 0) / 1000));
	const m = Math.floor(totalSec / 60);
	const s = totalSec % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

const GAME_COMPONENTS = {
	kanji_rain: KanjiRainGame,
	vocab_box: VocabBoxGame,
	particle_quiz: ParticleQuizGame,
	reading_rush: ReadingRushGame,
	meaning_rush: MeaningRushGame,
};

const GAME_ICONS = {
	kanji_rain: '漢',
	vocab_box: '箱',
	particle_quiz: '助',
	reading_rush: '読',
	meaning_rush: '義',
};

export default function ArenaPage() {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const lang = i18n.language || 'ja';

	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [phase, setPhase] = useState('hub');
	const [sessionGames, setSessionGames] = useState([]);
	const [gameIndex, setGameIndex] = useState(0);
	const [submissions, setSubmissions] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState(null);

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	const loadStatus = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setError('');
		try {
			const data = await getArenaStatus();
			setStatus(data);
			if (data.myAttempt?.status === 'submitted') {
				setPhase('result');
				setResult({
					score: data.myAttempt.score,
					correctCount: data.myAttempt.correctCount,
					totalCount: data.myAttempt.totalCount,
					durationMs: data.myAttempt.durationMs,
					gameResults: data.myAttempt.gameResults ?? [],
					myRank: data.myRank,
					leaderboard: data.leaderboard ?? [],
				});
			}
		} catch (err) {
			setError(getApiErrorMessage(err, t));
		} finally {
			setLoading(false);
		}
	}, [user, t]);

	useEffect(() => {
		void loadStatus();
	}, [loadStatus]);

	const windowOpen = status?.window?.isOpen;
	const scheduleLabel = useMemo(() => {
		const s = status?.settings;
		if (!s) return '';
		const days = (s.weekdays ?? [6])
			.slice()
			.sort((a, b) => a - b)
			.map((d) =>
				t(
					`arenaPage.weekday.${['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d] ?? 'sat'}`,
				),
			)
			.join(', ');
		return t('arenaPage.scheduleWeekly', {
			days,
			start: s.startTime,
			end: s.endTime,
			tz: s.timezone,
		});
	}, [status, t]);

	const title =
		lang.startsWith('vi')
			? status?.settings?.titleVi || t('arenaPage.title')
			: status?.settings?.titleJa || t('arenaPage.title');

	const activeGames = useMemo(
		() => (status?.games ?? []).filter((g) => g.isActive !== false),
		[status?.games],
	);

	const handleBegin = async () => {
		setError('');
		try {
			const data = await beginArenaChallenge();
			const games = (data.session?.games ?? []).filter((g) => g.payload?.items?.length);
			if (!games.length) {
				setError(t('arenaPage.noGames'));
				return;
			}
			setSessionGames(games);
			setGameIndex(0);
			setSubmissions([]);
			setPhase('play');
		} catch (err) {
			setError(getApiErrorMessage(err, t));
		}
	};

	const handleGameComplete = async (submission) => {
		const nextSubs = [...submissions.filter((s) => s.gameKey !== submission.gameKey), submission];
		setSubmissions(nextSubs);

		if (gameIndex + 1 < sessionGames.length) {
			setGameIndex((i) => i + 1);
			return;
		}

		setSubmitting(true);
		setError('');
		try {
			const data = await submitArenaChallenge(nextSubs);
			setResult({
				...data.result,
				myRank: data.myRank,
				leaderboard: data.leaderboard ?? [],
			});
			setPhase('result');
			void loadStatus();
		} catch (err) {
			setError(getApiErrorMessage(err, t));
		} finally {
			setSubmitting(false);
		}
	};

	const currentGame = sessionGames[gameIndex];
	const GameComponent = currentGame ? GAME_COMPONENTS[currentGame.gameKey] : null;

	return (
		<Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('arenaPage.breadcrumb') },
				]}
			/>

			<article className="vocab-sheet grammar-sheet arena-sheet arena-page">
				<StudyPageHeader titleId="arena-title" title={title} subtitle={t('arenaPage.subtitle')} />

				{loading ? (
					<p className="grammar-empty">{t('common.loading')}</p>
				) : error ? (
					<p className="grammar-empty grammar-empty--error" role="alert">
						{error}
					</p>
				) : null}

				{phase === 'hub' && !loading ? (
					<>
						<div
							className={`arena-status-card${windowOpen ? '' : ' arena-status-card--closed'}`}
						>
							<span
								className={`arena-open-badge ${windowOpen ? 'arena-open-badge--live' : 'arena-open-badge--off'}`}
							>
								{windowOpen ? t('arenaPage.openNow') : t('arenaPage.closed')}
							</span>
							<h2 className="arena-status-title">
								{windowOpen ? t('arenaPage.openTitle') : t('arenaPage.closedTitle')}
							</h2>
							<p className="arena-status-meta">{scheduleLabel}</p>
							<p className="arena-status-meta">
								{t('arenaPage.rulesMulti', {
									count: activeGames.length,
									jlpt: status?.userJlpt ?? 'N5',
								})}
							</p>
							<div className="arena-hub-games">
								{activeGames.map((g, i) => (
									<div key={g.gameKey} className="arena-hub-game-card">
										<span className="arena-hub-game-icon" aria-hidden="true">
											{GAME_ICONS[g.gameKey] ?? i + 1}
										</span>
										<div>
											<strong className="arena-hub-game-name">
												{lang.startsWith('vi') ? g.titleVi : g.titleJa || g.titleVi}
											</strong>
											<span className="arena-hub-game-step">
												{t('arenaPage.hubGameStep', { n: i + 1 })}
											</span>
										</div>
									</div>
								))}
							</div>
							<div className="arena-actions arena-actions--center">
								<button
									type="button"
									className="arena-btn arena-btn--primary arena-btn--lg"
									disabled={!windowOpen || status?.myAttempt?.status === 'submitted'}
									onClick={() => void handleBegin()}
								>
									{status?.myAttempt?.status === 'submitted'
										? t('arenaPage.alreadyPlayed')
										: t('arenaPage.enter')}
								</button>
							</div>
						</div>
						<LeaderboardBlock
							title={t('arenaPage.leaderboardTodayLevel', {
								jlpt: status?.userJlpt ?? 'N5',
							})}
							entries={status?.leaderboard ?? []}
							t={t}
						/>
					</>
				) : null}

				{phase === 'play' && currentGame && GameComponent ? (
					<div className="arena-play-wrap">
						<ArenaStepBar
							games={sessionGames}
							currentIndex={gameIndex}
							lang={lang}
							t={t}
						/>
						{submitting ? (
							<p className="arena-loading">{t('arenaPage.submitting')}</p>
						) : (
							<div className="arena-game-shell">
								<Suspense fallback={<p className="arena-loading">{t('common.loading')}</p>}>
									<GameComponent
										game={currentGame}
										lang={lang}
										onComplete={handleGameComplete}
									/>
								</Suspense>
							</div>
						)}
					</div>
				) : null}

				{phase === 'result' && result ? (
					<>
						<div className="arena-status-card arena-result-card">
							<p className="arena-result-label">{t('arenaPage.totalScore')}</p>
							<p className="arena-result-score">{result.score}</p>
							<p className="arena-status-meta">
								{t('arenaPage.resultSummary', {
									correct: result.correctCount,
									total: result.totalCount,
									time: formatDuration(result.durationMs),
								})}
							</p>
							<ul className="arena-result-breakdown">
								{(result.gameResults ?? []).map((gr) => (
									<li key={gr.gameKey}>
										<span>{t(`arenaPage.game.${gr.gameKey}`, { defaultValue: gr.gameKey })}</span>
										<strong>
											{gr.score} {t('arenaPage.points')}
										</strong>
									</li>
								))}
							</ul>
							{result.myRank ? (
								<p className="arena-status-meta">
									{t('arenaPage.yourRank', { rank: result.myRank.rank })}
								</p>
							) : null}
						</div>
						<LeaderboardBlock
							title={t('arenaPage.leaderboardTodayLevel', {
								jlpt: status?.userJlpt ?? 'N5',
							})}
							entries={result.leaderboard ?? []}
							t={t}
						/>
					</>
				) : null}
			</article>
		</Layout>
	);
}

function ArenaStepBar({ games, currentIndex, lang, t }) {
	return (
		<nav className="arena-steps" aria-label={t('arenaPage.stepsAria')}>
			{games.map((g, i) => {
				const done = i < currentIndex;
				const active = i === currentIndex;
				return (
					<div
						key={g.gameKey}
						className={`arena-step${done ? ' arena-step--done' : ''}${active ? ' arena-step--active' : ''}`}
					>
						<span className="arena-step-icon">{GAME_ICONS[g.gameKey] ?? i + 1}</span>
						<span className="arena-step-label">
							{lang.startsWith('vi') ? g.titleVi : g.titleJa || g.titleVi}
						</span>
					</div>
				);
			})}
		</nav>
	);
}

function LeaderboardBlock({ title, entries, t }) {
	if (!entries?.length) {
		return (
			<div className="arena-leaderboard">
				<h3>{title}</h3>
				<p className="arena-status-meta">{t('arenaPage.leaderboardEmpty')}</p>
			</div>
		);
	}
	return (
		<div className="arena-leaderboard arena-leaderboard--card">
			<h3 className="arena-leaderboard-title">{title}</h3>
			<div className="arena-lb-scroll">
			<table className="arena-lb-table">
				<thead>
					<tr>
						<th>#</th>
						<th>{t('arenaPage.colPlayer')}</th>
						<th>{t('arenaPage.colScore')}</th>
						<th>{t('arenaPage.colTime')}</th>
					</tr>
				</thead>
				<tbody>
					{entries.map((row) => (
						<tr key={`${row.rank}-${row.userId}`}>
							<td>{row.rank}</td>
							<td>{row.name}</td>
							<td>{row.score}</td>
							<td>{formatDuration(row.durationMs)}</td>
						</tr>
					))}
				</tbody>
			</table>
			</div>
		</div>
	);
}
