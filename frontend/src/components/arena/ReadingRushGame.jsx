import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ReadingRushGame({ game, onComplete }) {
	const { t } = useTranslation();
	const items = game?.payload?.items ?? [];
	const [idx, setIdx] = useState(0);
	const [answers, setAnswers] = useState([]);
	const startedRef = useRef(Date.now());
	const doneRef = useRef(false);

	const current = items[idx];
	const progressPct = items.length
		? Math.round(((idx + (answers.length > idx ? 1 : 0)) / items.length) * 100)
		: 0;

	const finish = useCallback(
		(nextAnswers) => {
			if (doneRef.current) return;
			doneRef.current = true;
			onComplete({
				gameKey: game.gameKey,
				durationMs: Date.now() - startedRef.current,
				answers: nextAnswers,
			});
		},
		[game.gameKey, onComplete],
	);

	const pickChoice = (choiceIndex) => {
		if (!current || doneRef.current) return;
		const nextAnswers = [...answers, { id: current.id, choiceIndex }];
		setAnswers(nextAnswers);
		if (idx + 1 >= items.length) {
			finish(nextAnswers);
		} else {
			setIdx((i) => i + 1);
		}
	};

	return (
		<div className="arena-game arena-game--reading">
			<div className="arena-game-head">
				<h2 className="arena-game-title">
					{game.titleVi || t('arenaPage.game.reading_rush')}
				</h2>
				<span className="arena-game-badge">
					{t('arenaPage.questionN', { n: idx + 1 })} / {items.length}
				</span>
			</div>
			<div className="arena-progress-bar" role="progressbar" aria-valuenow={progressPct}>
				<div className="arena-progress-bar-fill" style={{ width: `${progressPct}%` }} />
			</div>
			<p className="arena-game-hint">{t('arenaPage.readingHint')}</p>
			{current ? (
				<div className="arena-reading-card">
					<p className="arena-reading-word">{current.wordJa}</p>
					<div className="arena-particle-choices" role="group">
						{(current.choices || []).map((label, ci) => (
							<button
								key={`${current.id}-${ci}`}
								type="button"
								className="arena-particle-choice"
								onClick={() => pickChoice(ci)}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			) : (
				<p className="arena-status-meta">{t('arenaPage.noGames')}</p>
			)}
		</div>
	);
}
