import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { checkKanjiAnswer } from '../../services/arenaService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';

function shuffleItems(items) {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export default function KanjiRainGame({ game, onComplete }) {
	const { t } = useTranslation();
	const items = useMemo(
		() =>
			(game?.payload?.items ?? []).filter((row) =>
				String(row?.char ?? '').trim(),
			),
		[game?.payload?.items],
	);
	const config = game?.payload?.config ?? {};
	const durationSec = config.durationSeconds ?? 120;
	const penaltySec = config.penaltySeconds ?? 5;
	const queue = useMemo(() => shuffleItems(items), [items]);
	const [index, setIndex] = useState(0);
	const [typed, setTyped] = useState('');
	const [liveScore, setLiveScore] = useState(0);
	const [answeredCount, setAnsweredCount] = useState(0);
	const [wrongCount, setWrongCount] = useState(0);
	const answersRef = useRef([]);
	const [skipped, setSkipped] = useState(0);
	const [remaining, setRemaining] = useState(durationSec);
	const [feedback, setFeedback] = useState(null);
	const [busy, setBusy] = useState(false);
	const startedRef = useRef(Date.now());
	const doneRef = useRef(false);

	const current = queue[index] ?? null;

	const finish = useCallback(() => {
		if (doneRef.current) return;
		doneRef.current = true;
		onComplete({
			gameKey: game.gameKey,
			durationMs: Date.now() - startedRef.current,
			answers: answersRef.current,
		});
	}, [game.gameKey, onComplete]);

	const applyPenalty = useCallback((seconds) => {
		const sec = Number(seconds) || penaltySec;
		setRemaining((r) => Math.max(0, r - sec));
		setFeedback({ type: 'penalty', seconds: sec });
	}, [penaltySec]);

	useEffect(() => {
		if (!feedback) return undefined;
		const id = window.setTimeout(() => setFeedback(null), 900);
		return () => window.clearTimeout(id);
	}, [feedback]);

	useEffect(() => {
		if (!items.length) {
			finish();
			return undefined;
		}
		const id = window.setInterval(() => {
			setRemaining((r) => {
				if (r <= 1) {
					window.clearInterval(id);
					finish();
					return 0;
				}
				return r - 1;
			});
		}, 1000);
		return () => window.clearInterval(id);
	}, [items.length, finish]);

	const goNext = () => {
		setTyped('');
		if (index + 1 >= queue.length) {
			setIndex(0);
		} else {
			setIndex((i) => i + 1);
		}
	};

	const handleResult = (result, entry) => {
		if (entry) {
			const next = [...answersRef.current, entry];
			answersRef.current = next;
			setAnsweredCount(next.length);
		}
		if (result.correct) {
			setLiveScore((s) => s + (result.scoreDelta || 0));
			setFeedback({ type: 'correct', points: result.scoreDelta });
		} else if (result.penaltySeconds) {
			setWrongCount((n) => n + 1);
			applyPenalty(result.penaltySeconds);
		}
		goNext();
	};

	const submitTyped = async (e) => {
		e.preventDefault();
		if (!current || busy || doneRef.current) return;
		const value = typed.trim();
		if (!value) return;
		setBusy(true);
		try {
			const result = await checkKanjiAnswer({
				id: current.id,
				typed: value,
				skipped: false,
			});
			handleResult(result, { id: current.id, typed: value });
		} catch (err) {
			setFeedback({ type: 'error', message: getApiErrorMessage(err, t) });
		} finally {
			setBusy(false);
		}
	};

	const handleSkip = async () => {
		if (!current || busy || doneRef.current) return;
		setBusy(true);
		try {
			const result = await checkKanjiAnswer({
				id: current.id,
				skipped: true,
			});
			setSkipped((n) => n + 1);
			handleResult(result, null);
		} catch (err) {
			setFeedback({ type: 'error', message: getApiErrorMessage(err, t) });
		} finally {
			setBusy(false);
		}
	};

	const mins = Math.floor(remaining / 60);
	const secs = remaining % 60;
	const timerPct = durationSec ? Math.round((remaining / durationSec) * 100) : 0;

	return (
		<div className="arena-game arena-game--kanji">
			<div className="arena-game-head">
				<h2 className="arena-game-title">
					{game.titleVi || t('arenaPage.game.kanji_rain')}
				</h2>
				<div className="arena-kanji-head-stats">
					<span className="arena-game-timer arena-game-badge">
						{t('arenaPage.timeLeft', {
							time: `${mins}:${String(secs).padStart(2, '0')}`,
						})}
					</span>
					<span className="arena-kanji-live-score">
						{t('arenaPage.kanjiLiveScore', { score: liveScore })}
					</span>
				</div>
			</div>
			<div className="arena-progress-bar arena-progress-bar--timer">
				<div
					className="arena-progress-bar-fill arena-progress-bar-fill--timer"
					style={{ width: `${timerPct}%` }}
				/>
			</div>
			<p className="arena-game-hint">
				{t('arenaPage.kanjiSimpleHint', { minutes: Math.floor(durationSec / 60), penalty: penaltySec })}
			</p>

			{feedback ? (
				<p
					className={`arena-kanji-feedback arena-kanji-feedback--${feedback.type}`}
					role="status"
				>
					{feedback.type === 'correct'
						? t('arenaPage.kanjiCorrect', { points: feedback.points })
						: feedback.type === 'penalty'
							? t('arenaPage.kanjiPenalty', { seconds: feedback.seconds })
							: feedback.message}
				</p>
			) : null}

			{!items.length ? (
				<p className="arena-kanji-missing" role="alert">
					{t('arenaPage.kanjiNoData')}
				</p>
			) : current?.char ? (
				<div className="arena-kanji-card">
					<p className="arena-kanji-label">{t('arenaPage.kanjiTargetLabel')}</p>
					<p className="arena-kanji-char" lang="ja">
						{current.char}
					</p>
				</div>
			) : null}

			<form className="arena-kanji-input-row" onSubmit={(e) => void submitTyped(e)}>
				<input
					type="text"
					className="arena-kanji-input"
					value={typed}
					onChange={(e) => setTyped(e.target.value)}
					placeholder={t('arenaPage.kanjiPlaceholder')}
					autoComplete="off"
					autoFocus
					disabled={!items.length || busy}
				/>
				<div className="arena-kanji-actions">
					<button
						type="submit"
						className="arena-btn arena-btn--primary arena-btn--lg"
						disabled={!items.length || busy}
					>
						{busy ? t('common.loading') : t('arenaPage.kanjiSubmit')}
					</button>
					<button
						type="button"
						className="arena-btn arena-btn--ghost arena-btn--lg"
						onClick={() => void handleSkip()}
						disabled={!items.length || busy}
					>
						{t('arenaPage.kanjiSkip')}
					</button>
				</div>
			</form>

			<p className="arena-game-stat">
				{t('arenaPage.kanjiStats', {
					answered: answeredCount,
					skipped,
					wrong: wrongCount,
				})}
			</p>

			<button type="button" className="arena-btn arena-btn--ghost" onClick={() => finish()}>
				{t('arenaPage.finishGame')}
			</button>
		</div>
	);
}
