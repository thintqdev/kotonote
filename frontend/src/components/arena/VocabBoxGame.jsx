import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function VocabBoxGame({ game, onComplete }) {
	const { t } = useTranslation();
	const items = game?.payload?.items ?? [];
	const config = game?.payload?.config ?? {};
	const maxHope = config.maxHopeStars ?? 3;
	const [boxIndex, setBoxIndex] = useState(null);
	const [hopeUsed, setHopeUsed] = useState(0);
	const [hopeOn, setHopeOn] = useState(false);
	const [answers, setAnswers] = useState([]);
	const startedRef = useRef(Date.now());
	const doneRef = useRef(false);

	const current = boxIndex != null ? items.find((it) => it.boxIndex === boxIndex) : null;
	const answeredIds = new Set(answers.map((a) => a.id));
	const doneCount = answers.length;
	const progressPct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

	const finish = useCallback(() => {
		if (doneRef.current) return;
		doneRef.current = true;
		onComplete({
			gameKey: game.gameKey,
			durationMs: Date.now() - startedRef.current,
			answers,
		});
	}, [answers, game.gameKey, onComplete]);

	const pickBox = (n) => {
		const item = items.find((it) => it.boxIndex === n);
		if (!item || answeredIds.has(item.id)) return;
		setBoxIndex(n);
		setHopeOn(false);
	};

	const confirmChoice = (choiceIndex) => {
		if (!current || doneRef.current) return;
		const hopeStar = hopeOn && hopeUsed < maxHope;
		if (hopeStar) setHopeUsed((u) => u + 1);
		setAnswers((prev) => [
			...prev,
			{ id: current.id, choiceIndex, hopeStar },
		]);
		setBoxIndex(null);
		setHopeOn(false);
		if (answers.length + 1 >= items.length) finish();
	};

	const allDone = answers.length >= items.length && items.length > 0;

	return (
		<div className="arena-game arena-game--vocab">
			<div className="arena-game-head">
				<h2 className="arena-game-title">
					{game.titleVi || t('arenaPage.game.vocab_box')}
				</h2>
				<span className="arena-game-badge">
					{doneCount} / {items.length}
				</span>
			</div>
			<div className="arena-progress-bar" role="progressbar" aria-valuenow={progressPct}>
				<div className="arena-progress-bar-fill" style={{ width: `${progressPct}%` }} />
			</div>
			<p className="arena-game-hint">{t('arenaPage.vocabBoxHint', { max: maxHope })}</p>
			<div className="arena-vocab-boxes" role="list">
				{items.map((it) => {
					const done = answeredIds.has(it.id);
					return (
						<button
							key={it.id}
							type="button"
							className={`arena-vocab-box${done ? ' arena-vocab-box--done' : ''}${boxIndex === it.boxIndex ? ' arena-vocab-box--active' : ''}`}
							disabled={done}
							onClick={() => pickBox(it.boxIndex)}
						>
							<span className="arena-vocab-box-num">{it.boxIndex}</span>
						</button>
					);
				})}
			</div>
			{current && !allDone ? (
				<div className="arena-vocab-quiz arena-particle-card">
					<p className="arena-vocab-word">{current.wordJa}</p>
					{current.reading ? (
						<p className="arena-vocab-reading">{current.reading}</p>
					) : null}
					{hopeUsed < maxHope ? (
						<label className="arena-hope-star">
							<input
								type="checkbox"
								checked={hopeOn}
								onChange={(e) => setHopeOn(e.target.checked)}
							/>
							<span>★ {t('arenaPage.hopeStar')}</span>
							<span className="arena-hope-count">
								({hopeUsed}/{maxHope})
							</span>
						</label>
					) : null}
					<div className="arena-choices arena-choices--stack">
						{(current.choices || []).map((choice, ci) => (
							<button
								key={`${current.id}-${ci}`}
								type="button"
								className="arena-choice arena-choice--large"
								onClick={() => confirmChoice(ci)}
							>
								{choice}
							</button>
						))}
					</div>
				</div>
			) : null}
			<div className="arena-actions">
				{allDone ? (
					<button type="button" className="arena-btn arena-btn--primary arena-btn--lg" onClick={finish}>
						{t('arenaPage.nextGame')}
					</button>
				) : (
					<button type="button" className="arena-btn arena-btn--ghost" onClick={finish}>
						{t('arenaPage.finishGame')}
					</button>
				)}
			</div>
		</div>
	);
}
