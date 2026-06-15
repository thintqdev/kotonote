import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
	deleteAdminKanji,
	deleteAdminParticle,
	deleteAdminVocab,
	getAdminArenaDashboard,
	importAdminKanji,
	importAdminParticles,
	importAdminVocab,
	listAdminKanji,
	listAdminParticles,
	listAdminVocab,
	updateAdminArenaGame,
	updateAdminArenaSettings,
	updateAdminKanji,
	updateAdminParticle,
	updateAdminVocab,
} from '../../services/adminArenaService.js';
import { getAxiosErrorMessage } from '../../utils/apiErrorMessage.js';
import { GRAMMAR_JLPT_LEVELS } from '../../constants/grammarFieldMeta.js';
import { ARENA_MAX_ACTIVE_GAMES } from '../../constants/arena.js';
import {
	ARENA_END_TIME_OPTIONS,
	ARENA_START_TIME_OPTIONS,
	ARENA_TIMEZONE_OPTIONS,
} from '../../constants/arenaAdminOptions.js';
import './AdminGrammarPage.css';
import './AdminArenaPage.css';

const WEEKDAY_OPTS = [
	{ v: 0, key: 'sun' },
	{ v: 1, key: 'mon' },
	{ v: 2, key: 'tue' },
	{ v: 3, key: 'wed' },
	{ v: 4, key: 'thu' },
	{ v: 5, key: 'fri' },
	{ v: 6, key: 'sat' },
];

const BASE_TABS = ['schedule', 'games'];

/** Tab dữ liệu theo gameKey đang bật → loại panel import/list */
const DATA_PANEL_BY_GAME = {
	kanji_rain: 'kanji',
	vocab_box: 'vocab',
	reading_rush: 'vocab',
	meaning_rush: 'vocab',
	particle_quiz: 'particle',
};

const VOCAB_DATA_GAME_KEYS = ['vocab_box', 'reading_rush', 'meaning_rush'];

function buildDataTabEntries(activeGames) {
	const entries = [];
	const orderOf = (key) =>
		activeGames.findIndex((g) => g.gameKey === key);

	if (activeGames.some((g) => g.gameKey === 'kanji_rain')) {
		entries.push({ id: 'kanji_rain', kind: 'kanji' });
	}
	const vocabGames = activeGames.filter((g) =>
		VOCAB_DATA_GAME_KEYS.includes(g.gameKey),
	);
	if (vocabGames.length) {
		entries.push({ id: 'vocab', kind: 'vocab', vocabGames });
	}
	if (activeGames.some((g) => g.gameKey === 'particle_quiz')) {
		entries.push({ id: 'particle_quiz', kind: 'particle' });
	}

	entries.sort((a, b) => {
		const aKey =
			a.kind === 'vocab'
				? VOCAB_DATA_GAME_KEYS.find((k) => orderOf(k) >= 0) ?? 'vocab_box'
				: a.id;
		const bKey =
			b.kind === 'vocab'
				? VOCAB_DATA_GAME_KEYS.find((k) => orderOf(k) >= 0) ?? 'vocab_box'
				: b.id;
		return orderOf(aKey) - orderOf(bKey);
	});

	return entries;
}

const KANJI_SAMPLE = `[
  { "char": "日", "hanViet": "nhật", "onYomi": "ニチ", "kunYomi": "ひ" },
  { "char": "月", "hanViet": "nguyệt", "onYomi": "ゲツ", "kunYomi": "つき" }
]`;

const VOCAB_SAMPLE = `[
  {
    "wordJa": "本",
    "reading": "ほん",
    "choices": ["sách", "nhà", "nước", "xe"],
    "answerIndex": 0
  }
]`;

const PARTICLE_SAMPLE = `[
  {
    "sentenceJa": "図書館___本を読みます。",
    "sentenceVi": "Đọc sách ở thư viện",
    "answer": "で"
  }
]`;

export default function AdminArenaPage() {
	const { t } = useTranslation();
	const [tab, setTab] = useState('schedule');
	const [settings, setSettings] = useState(null);
	const [windowState, setWindowState] = useState(null);
	const [games, setGames] = useState([]);
	const [stats, setStats] = useState({ kanji: 0, vocab: 0, particle: 0 });
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [jlptFilter, setJlptFilter] = useState('N4');
	const [kanjiList, setKanjiList] = useState([]);
	const [vocabList, setVocabList] = useState([]);
	const [particleList, setParticleList] = useState([]);
	const [kanjiJson, setKanjiJson] = useState(KANJI_SAMPLE);
	const [vocabJson, setVocabJson] = useState(VOCAB_SAMPLE);
	const [particleJson, setParticleJson] = useState(PARTICLE_SAMPLE);
	const [scheduleEditing, setScheduleEditing] = useState(false);
	const [scheduleSnapshot, setScheduleSnapshot] = useState(null);
	const [gamesEditing, setGamesEditing] = useState(false);
	const [gamesSnapshot, setGamesSnapshot] = useState(null);
	const [editKanjiId, setEditKanjiId] = useState(null);
	const [kanjiEdit, setKanjiEdit] = useState(null);
	const [editVocabId, setEditVocabId] = useState(null);
	const [vocabEdit, setVocabEdit] = useState(null);
	const [editParticleId, setEditParticleId] = useState(null);
	const [particleEdit, setParticleEdit] = useState(null);

	const loadDashboard = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getAdminArenaDashboard();
			setSettings(data.settings ?? null);
			setWindowState(data.window ?? null);
			setGames(data.games ?? []);
			setStats(data.stats ?? { kanji: 0, vocab: 0, particle: 0 });
		} catch (err) {
			toast.error(getAxiosErrorMessage(err, t));
		} finally {
			setLoading(false);
		}
	}, [t]);

	const activeGames = useMemo(
		() =>
			[...games]
				.filter((g) => g.isActive !== false)
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		[games],
	);

	const dataTabEntries = useMemo(() => buildDataTabEntries(activeGames), [activeGames]);

	const visibleTabs = useMemo(
		() => [...BASE_TABS, ...dataTabEntries.map((e) => e.id)],
		[dataTabEntries],
	);

	const currentDataTab = dataTabEntries.find((e) => e.id === tab) ?? null;
	const dataPanelKind = currentDataTab?.kind ?? null;

	const tabLabel = (id) => {
		if (id === 'schedule' || id === 'games') {
			return t(`adminArena.tab.${id}`);
		}
		const entry = dataTabEntries.find((e) => e.id === id);
		if (entry?.kind === 'vocab' && entry.vocabGames?.length) {
			return entry.vocabGames.map((g) => g.titleVi).join(' · ');
		}
		const game = games.find((g) => g.gameKey === id);
		return game?.titleVi || t(`adminArena.tab.${id}`, { defaultValue: id });
	};

	const loadDataTab = useCallback(async () => {
		const kind = dataTabEntries.find((e) => e.id === tab)?.kind;
		if (!kind) return;
		try {
			if (kind === 'kanji') {
				setKanjiList(await listAdminKanji(jlptFilter));
			} else if (kind === 'vocab') {
				setVocabList(await listAdminVocab(jlptFilter));
			} else if (kind === 'particle') {
				setParticleList(await listAdminParticles(jlptFilter));
			}
		} catch (err) {
			toast.error(getAxiosErrorMessage(err, t));
		}
	}, [tab, jlptFilter, t, dataTabEntries]);

	useEffect(() => {
		void loadDashboard();
	}, [loadDashboard]);

	useEffect(() => {
		if (dataTabEntries.some((e) => e.id === tab)) {
			void loadDataTab();
		}
	}, [tab, loadDataTab, dataTabEntries]);

	useEffect(() => {
		if (!visibleTabs.includes(tab)) {
			setTab('games');
		}
	}, [visibleTabs, tab]);

	useEffect(() => {
		if (tab !== 'schedule' && scheduleEditing && scheduleSnapshot) {
			setSettings(scheduleSnapshot);
			setScheduleEditing(false);
			setScheduleSnapshot(null);
		}
		if (tab !== 'games' && gamesEditing && gamesSnapshot) {
			setGames(gamesSnapshot);
			setGamesEditing(false);
			setGamesSnapshot(null);
		}
	}, [tab, scheduleEditing, scheduleSnapshot, gamesEditing, gamesSnapshot]);

	const startScheduleEdit = () => {
		if (!settings) return;
		setScheduleSnapshot(JSON.parse(JSON.stringify(settings)));
		setScheduleEditing(true);
	};

	const cancelScheduleEdit = () => {
		if (scheduleSnapshot) setSettings(scheduleSnapshot);
		setScheduleSnapshot(null);
		setScheduleEditing(false);
	};

	const saveSettings = async (e) => {
		e.preventDefault();
		if (!settings) return;
		setSaving(true);
		try {
			const data = await updateAdminArenaSettings(settings);
			setSettings(data.settings);
			setWindowState(data.window);
			setScheduleSnapshot(null);
			setScheduleEditing(false);
			toast.success(t('adminArena.settingsSaved'));
		} catch (err) {
			toast.error(getAxiosErrorMessage(err, t));
		} finally {
			setSaving(false);
		}
	};

	const patchGameLocal = (gameKey, patch) => {
		setGames((prev) =>
			prev.map((g) => (g.gameKey === gameKey ? { ...g, ...patch } : g)),
		);
	};

	const countActiveGames = (list, excludeKey) =>
		list.filter(
			(g) => g.isActive !== false && (!excludeKey || g.gameKey !== excludeKey),
		).length;

	const trySetGameActive = (gameKey, nextActive) => {
		if (nextActive) {
			const activeOthers = countActiveGames(games, gameKey);
			if (activeOthers >= ARENA_MAX_ACTIVE_GAMES) {
				toast.error(
					t('adminArena.maxActiveGames', { max: ARENA_MAX_ACTIVE_GAMES }),
				);
				return;
			}
		}
		patchGameLocal(gameKey, { isActive: nextActive });
	};

	const startGamesEdit = () => {
		setGamesSnapshot(JSON.parse(JSON.stringify(games)));
		setGamesEditing(true);
	};

	const cancelGamesEdit = () => {
		if (gamesSnapshot) setGames(gamesSnapshot);
		setGamesSnapshot(null);
		setGamesEditing(false);
	};

	const buildGamePatch = (game) => {
		const base = { isActive: game.isActive !== false };
		if (game.gameKey === 'kanji_rain') {
			return {
				...base,
				durationSeconds: Number(game.durationSeconds ?? 300),
				pointsPerCorrect: Number(game.pointsPerCorrect ?? 10),
				poolPickCount: Number(game.poolPickCount ?? 60),
				penaltySeconds: Number(game.penaltySeconds ?? 5),
			};
		}
		if (game.gameKey === 'vocab_box') {
			return {
				...base,
				boxCount: Number(game.boxCount ?? 12),
				pointsPerCorrect: Number(game.pointsPerCorrect ?? 10),
				hopeStarBonus: Number(game.hopeStarBonus ?? 20),
				hopeStarPenalty: Number(game.hopeStarPenalty ?? -10),
				maxHopeStars: Number(game.maxHopeStars ?? 3),
			};
		}
		if (
			game.gameKey === 'particle_quiz' ||
			game.gameKey === 'reading_rush' ||
			game.gameKey === 'meaning_rush'
		) {
			return {
				...base,
				questionCount: Number(game.questionCount ?? 20),
				pointsPerCorrect: Number(game.pointsPerCorrect ?? 10),
			};
		}
		return base;
	};

	const saveAllGames = async (e) => {
		e?.preventDefault();
		if (countActiveGames(games) > ARENA_MAX_ACTIVE_GAMES) {
			toast.error(t('adminArena.maxActiveGames', { max: ARENA_MAX_ACTIVE_GAMES }));
			return;
		}
		setSaving(true);
		try {
			const updated = await Promise.all(
				games.map(async (game) => {
					const data = await updateAdminArenaGame(game.gameKey, buildGamePatch(game));
					return data.game;
				}),
			);
			setGames(updated);
			setGamesSnapshot(null);
			setGamesEditing(false);
			toast.success(t('adminArena.gameSaved'));
		} catch (err) {
			toast.error(getAxiosErrorMessage(err, t));
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (fn, id, clearEdit) => {
		if (!window.confirm(t('adminArena.confirmDelete'))) return;
		try {
			await fn(id);
			toast.success(t('adminArena.questionDeleted'));
			clearEdit?.();
			void loadDataTab();
			void loadDashboard();
		} catch (err) {
			toast.error(getAxiosErrorMessage(err, t));
		}
	};

	const toggleActive = async (fn, id, isActive) => {
		try {
			await fn(id, { isActive });
			void loadDataTab();
			void loadDashboard();
		} catch (err) {
			toast.error(getAxiosErrorMessage(err, t));
		}
	};

	const handleKanjiImport = async () => {
		try {
			const items = JSON.parse(kanjiJson);
			if (!Array.isArray(items)) throw new Error('invalid');
			const data = await importAdminKanji(items, jlptFilter);
			toast.success(t('adminArena.kanjiImported', { count: data.inserted }));
			void loadDashboard();
			void loadDataTab();
		} catch (err) {
			toast.error(
				err instanceof SyntaxError
					? t('adminArena.kanjiJsonInvalid')
					: getAxiosErrorMessage(err, t),
			);
		}
	};

	const handleVocabImport = async () => {
		try {
			const items = JSON.parse(vocabJson);
			if (!Array.isArray(items)) throw new Error('invalid');
			const data = await importAdminVocab(items, jlptFilter);
			toast.success(t('adminArena.vocabImported', { count: data.inserted }));
			void loadDashboard();
			void loadDataTab();
		} catch (err) {
			toast.error(
				err instanceof SyntaxError
					? t('adminArena.kanjiJsonInvalid')
					: getAxiosErrorMessage(err, t),
			);
		}
	};

	const handleParticleImport = async () => {
		try {
			const items = JSON.parse(particleJson);
			if (!Array.isArray(items)) throw new Error('invalid');
			const data = await importAdminParticles(items, jlptFilter);
			toast.success(t('adminArena.particleImported', { count: data.inserted }));
			void loadDashboard();
			void loadDataTab();
		} catch (err) {
			toast.error(
				err instanceof SyntaxError
					? t('adminArena.kanjiJsonInvalid')
					: getAxiosErrorMessage(err, t),
			);
		}
	};

	const renderGameFieldsView = (game) => {
		const key = game.gameKey;
		const rows = [];
		if (key === 'kanji_rain') {
			rows.push(
				['durationSeconds', game.durationSeconds ?? 300],
				['pointsPerCorrect', game.pointsPerCorrect ?? 10],
				['poolPickCount', game.poolPickCount ?? 60],
				['penaltySeconds', game.penaltySeconds ?? 5],
			);
		} else if (key === 'vocab_box') {
			rows.push(
				['boxCount', game.boxCount ?? 12],
				['pointsPerCorrect', game.pointsPerCorrect ?? 10],
				['hopeStarBonus', game.hopeStarBonus ?? 20],
				['hopeStarPenalty', game.hopeStarPenalty ?? -10],
				['maxHopeStars', game.maxHopeStars ?? 3],
			);
		} else if (
			key === 'particle_quiz' ||
			key === 'reading_rush' ||
			key === 'meaning_rush'
		) {
			rows.push(
				['questionCount', game.questionCount ?? 20],
				['pointsPerCorrect', game.pointsPerCorrect ?? 10],
			);
		}
		return (
			<dl className="admin-arena-schedule-view admin-arena-game-view">
				{rows.map(([field, value]) => (
					<div key={field}>
						<dt>{t(`adminArena.${field}`)}</dt>
						<dd>{value}</dd>
					</div>
				))}
			</dl>
		);
	};

	const renderGameFields = (game) => {
		const key = game.gameKey;
		const patch = (p) => patchGameLocal(key, p);
		if (key === 'kanji_rain') {
			return (
				<div className="admin-arena-form-grid">
					<label>
						{t('adminArena.durationSeconds')}
						<input
							type="number"
							min={60}
							max={600}
							value={game.durationSeconds ?? 300}
							onChange={(e) =>
								patch({ durationSeconds: Number(e.target.value) })
							}
						/>
					</label>
					<label>
						{t('adminArena.pointsPerCorrect')}
						<input
							type="number"
							min={1}
							max={100}
							value={game.pointsPerCorrect ?? 10}
							onChange={(e) =>
								patch({ pointsPerCorrect: Number(e.target.value) })
							}
						/>
					</label>
					<label>
						{t('adminArena.poolPickCount')}
						<input
							type="number"
							min={10}
							max={200}
							value={game.poolPickCount ?? 60}
							onChange={(e) =>
								patch({ poolPickCount: Number(e.target.value) })
							}
						/>
					</label>
					<label>
						{t('adminArena.penaltySeconds')}
						<input
							type="number"
							min={0}
							max={60}
							value={game.penaltySeconds ?? 5}
							onChange={(e) =>
								patch({ penaltySeconds: Number(e.target.value) })
							}
						/>
					</label>
				</div>
			);
		}
		if (key === 'vocab_box') {
			return (
				<div className="admin-arena-form-grid">
					<label>
						{t('adminArena.boxCount')}
						<input
							type="number"
							min={1}
							max={12}
							value={game.boxCount ?? 12}
							onChange={(e) => patch({ boxCount: Number(e.target.value) })}
						/>
					</label>
					<label>
						{t('adminArena.pointsPerCorrect')}
						<input
							type="number"
							min={1}
							value={game.pointsPerCorrect ?? 10}
							onChange={(e) =>
								patch({ pointsPerCorrect: Number(e.target.value) })
							}
						/>
					</label>
					<label>
						{t('adminArena.hopeStarBonus')}
						<input
							type="number"
							min={0}
							value={game.hopeStarBonus ?? 20}
							onChange={(e) =>
								patch({ hopeStarBonus: Number(e.target.value) })
							}
						/>
					</label>
					<label>
						{t('adminArena.hopeStarPenalty')}
						<input
							type="number"
							max={0}
							value={game.hopeStarPenalty ?? -10}
							onChange={(e) =>
								patch({ hopeStarPenalty: Number(e.target.value) })
							}
						/>
					</label>
					<label>
						{t('adminArena.maxHopeStars')}
						<input
							type="number"
							min={0}
							max={12}
							value={game.maxHopeStars ?? 3}
							onChange={(e) =>
								patch({ maxHopeStars: Number(e.target.value) })
							}
						/>
					</label>
				</div>
			);
		}
		if (
			key === 'particle_quiz' ||
			key === 'reading_rush' ||
			key === 'meaning_rush'
		) {
			return (
				<div className="admin-arena-form-grid">
					<label>
						{t('adminArena.questionCount')}
						<input
							type="number"
							min={1}
							max={50}
							value={
								game.questionCount ??
								(key === 'particle_quiz' ? 20 : 15)
							}
							onChange={(e) =>
								patch({ questionCount: Number(e.target.value) })
							}
						/>
					</label>
					<label>
						{t('adminArena.pointsPerCorrect')}
						<input
							type="number"
							min={1}
							value={game.pointsPerCorrect ?? 10}
							onChange={(e) =>
								patch({ pointsPerCorrect: Number(e.target.value) })
							}
						/>
					</label>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="admin-stub-main admin-arena">
			<header className="admin-arena-header">
				<h1 className="admin-arena-title">{t('adminArena.title')}</h1>
				<p className="admin-arena-lead">{t('adminArena.lead')}</p>
			</header>

			<div className="admin-arena-stats">
				<div className="admin-arena-stat">
					<span className="admin-arena-stat-value">{stats.kanji ?? 0}</span>
					<span className="admin-arena-stat-label">{t('adminArena.statKanji')}</span>
				</div>
				<div className="admin-arena-stat">
					<span className="admin-arena-stat-value">{stats.vocab ?? 0}</span>
					<span className="admin-arena-stat-label">{t('adminArena.statVocab')}</span>
				</div>
				<div className="admin-arena-stat">
					<span className="admin-arena-stat-value">{stats.particle ?? 0}</span>
					<span className="admin-arena-stat-label">{t('adminArena.statParticle')}</span>
				</div>
			</div>

			<nav className="admin-arena-tabs" aria-label={t('adminArena.tabsAria')}>
				{visibleTabs.map((id) => (
					<button
						key={id}
						type="button"
						className={`admin-arena-tab${tab === id ? ' admin-arena-tab--active' : ''}`}
						onClick={() => setTab(id)}
					>
						{tabLabel(id)}
					</button>
				))}
			</nav>

			{loading && !settings ? (
				<p>{t('common.loading')}</p>
			) : null}

			{tab === 'schedule' && settings ? (
				<section className="admin-arena-panel">
					<h2 className="admin-arena-panel-title">{t('adminArena.scheduleTitle')}</h2>
					{windowState ? (
						<p
							className={`admin-arena-window ${windowState.isOpen ? 'admin-arena-window--open' : 'admin-arena-window--closed'}`}
						>
							{windowState.isOpen
								? t('adminArena.windowOpen')
								: t('adminArena.windowClosed')}
							{' · '}
							{t('adminArena.windowHint', {
								start: settings.startTime,
								end: settings.endTime,
							})}
						</p>
					) : null}
					<p className="admin-arena-lead">{t('adminArena.scheduleUserJlptNote')}</p>
					<div className="admin-arena-schedule-toolbar">
						{!scheduleEditing ? (
							<button
								type="button"
								className="admin-arena-btn"
								onClick={startScheduleEdit}
							>
								{t('adminArena.edit')}
							</button>
						) : null}
					</div>
					{!scheduleEditing ? (
						<dl className="admin-arena-schedule-view">
							<div>
								<dt>{t('adminArena.enabled')}</dt>
								<dd>
									{settings.enabled
										? t('adminArena.scheduleOn')
										: t('adminArena.scheduleOff')}
								</dd>
							</div>
							<div>
								<dt>{t('adminArena.startTime')}</dt>
								<dd>{settings.startTime || '20:00'}</dd>
							</div>
							<div>
								<dt>{t('adminArena.endTime')}</dt>
								<dd>{settings.endTime || '24:00'}</dd>
							</div>
							<div>
								<dt>{t('adminArena.timezone')}</dt>
								<dd>
									{ARENA_TIMEZONE_OPTIONS.find((tz) => tz.value === settings.timezone)
										?.label || settings.timezone}
								</dd>
							</div>
							<div>
								<dt>{t('adminArena.reminderMinutes')}</dt>
								<dd>{settings.reminderMinutesBefore ?? 30}</dd>
							</div>
							<div>
								<dt>{t('adminArena.titleVi')}</dt>
								<dd>{settings.titleVi || '—'}</dd>
							</div>
							<div>
								<dt>{t('adminArena.titleJa')}</dt>
								<dd>{settings.titleJa || '—'}</dd>
							</div>
							<div className="admin-arena-schedule-view--full">
								<dt>{t('adminArena.weekdays')}</dt>
								<dd>{formatScheduleWeekdays(settings.weekdays, t)}</dd>
							</div>
						</dl>
					) : (
					<form onSubmit={saveSettings}>
						<div className="admin-arena-form-grid">
							<div className="admin-arena-enabled-row">
								<ActiveSwitch
									checked={Boolean(settings.enabled)}
									label={t('adminArena.enabled')}
									onChange={(next) =>
										setSettings((s) => ({ ...s, enabled: next }))
									}
								/>
							</div>
							<label>
								{t('adminArena.startTime')}
								<select
									value={settings.startTime || '20:00'}
									onChange={(e) =>
										setSettings((s) => ({ ...s, startTime: e.target.value }))
									}
								>
									{ARENA_START_TIME_OPTIONS.map((slot) => (
										<option key={slot} value={slot}>
											{slot}
										</option>
									))}
								</select>
							</label>
							<label>
								{t('adminArena.endTime')}
								<select
									value={settings.endTime || '24:00'}
									onChange={(e) =>
										setSettings((s) => ({ ...s, endTime: e.target.value }))
									}
								>
									{ARENA_END_TIME_OPTIONS.map((slot) => (
										<option key={slot} value={slot}>
											{slot}
										</option>
									))}
								</select>
							</label>
							<label>
								{t('adminArena.timezone')}
								<select
									value={settings.timezone || 'Asia/Ho_Chi_Minh'}
									onChange={(e) =>
										setSettings((s) => ({ ...s, timezone: e.target.value }))
									}
								>
									{ARENA_TIMEZONE_OPTIONS.map((tz) => (
										<option key={tz.value} value={tz.value}>
											{tz.label}
										</option>
									))}
								</select>
							</label>
							<label>
								{t('adminArena.reminderMinutes')}
								<input
									type="number"
									min={5}
									max={180}
									value={settings.reminderMinutesBefore ?? 30}
									onChange={(e) =>
										setSettings((s) => ({
											...s,
											reminderMinutesBefore: Number(e.target.value),
										}))
									}
								/>
							</label>
							<label>
								{t('adminArena.titleVi')}
								<input
									type="text"
									value={settings.titleVi || ''}
									onChange={(e) =>
										setSettings((s) => ({ ...s, titleVi: e.target.value }))
									}
								/>
							</label>
							<label>
								{t('adminArena.titleJa')}
								<input
									type="text"
									value={settings.titleJa || ''}
									onChange={(e) =>
										setSettings((s) => ({ ...s, titleJa: e.target.value }))
									}
								/>
							</label>
							<label className="admin-arena-weekdays" style={{ gridColumn: '1 / -1' }}>
								<span>{t('adminArena.weekdays')}</span>
								<div className="admin-arena-weekdays-grid">
									{WEEKDAY_OPTS.map(({ v, key }) => {
										const days = settings.weekdays ?? [6];
										const checked = days.includes(v);
										return (
											<label key={key} className="admin-arena-weekday-chip">
												<input
													type="checkbox"
													checked={checked}
													onChange={() => {
														setSettings((s) => {
															const cur = [...(s.weekdays ?? [6])];
															const next = checked
																? cur.filter((d) => d !== v)
																: [...cur, v].sort((a, b) => a - b);
															return {
																...s,
																weekdays: next.length ? next : [6],
															};
														});
													}}
												/>
												{t(`arenaPage.weekday.${key}`)}
											</label>
										);
									})}
								</div>
							</label>
						</div>
						<div className="admin-arena-schedule-actions">
							<button type="submit" className="admin-arena-btn" disabled={saving}>
								{saving ? t('common.loading') : t('adminArena.saveSettings')}
							</button>
							<button
								type="button"
								className="admin-arena-btn admin-arena-btn--ghost"
								disabled={saving}
								onClick={cancelScheduleEdit}
							>
								{t('adminArena.cancel')}
							</button>
						</div>
					</form>
					)}
				</section>
			) : null}

			{tab === 'games' ? (
				<section className="admin-arena-panel">
					<h2 className="admin-arena-panel-title">{t('adminArena.gamesTitle')}</h2>
					<p className="admin-arena-lead">{t('adminArena.gamesLead')}</p>
					<p className="admin-arena-active-count">
						{t('adminArena.activeGamesCount', {
							current: countActiveGames(games),
							max: ARENA_MAX_ACTIVE_GAMES,
						})}
					</p>
					<div className="admin-arena-schedule-toolbar">
						{!gamesEditing ? (
							<button
								type="button"
								className="admin-arena-btn"
								onClick={startGamesEdit}
							>
								{t('adminArena.edit')}
							</button>
						) : null}
					</div>
					<div className="admin-arena-games">
						{games.map((game) => {
							const icon =
								{
									kanji_rain: '雨',
									vocab_box: '箱',
									particle_quiz: '助',
									reading_rush: '読',
									meaning_rush: '義',
								}[
									game.gameKey
								] ?? '◎';
							return (
								<article key={game.gameKey} className="admin-arena-game-card">
									<div className="admin-arena-game-head">
										<h3 className="admin-arena-game-name">
											<span aria-hidden="true">{icon} </span>
											{game.titleVi || game.gameKey}
										</h3>
										{gamesEditing ? (
											<ActiveSwitch
												checked={game.isActive !== false}
												label={t('adminArena.gameActive')}
												onChange={(next) =>
													trySetGameActive(game.gameKey, next)
												}
											/>
										) : (
											<span className="admin-arena-game-status">
												{t('adminArena.gameActive')}:{' '}
												{game.isActive !== false
													? t('adminArena.scheduleOn')
													: t('adminArena.scheduleOff')}
											</span>
										)}
									</div>
									<p className="admin-arena-game-desc">{game.descriptionVi}</p>
									{gamesEditing
										? renderGameFields(game)
										: renderGameFieldsView(game)}
								</article>
							);
						})}
					</div>
					{gamesEditing ? (
						<div className="admin-arena-schedule-actions">
							<button
								type="button"
								className="admin-arena-btn"
								disabled={saving}
								onClick={() => void saveAllGames()}
							>
								{saving ? t('common.loading') : t('adminArena.saveGames')}
							</button>
							<button
								type="button"
								className="admin-arena-btn admin-arena-btn--ghost"
								disabled={saving}
								onClick={cancelGamesEdit}
							>
								{t('adminArena.cancel')}
							</button>
						</div>
					) : null}
				</section>
			) : null}

			{dataPanelKind ? (
				<section className="admin-arena-panel">
					<div className="admin-arena-form-grid" style={{ marginBottom: 16 }}>
						<label>
							{t('adminArena.jlptFilter')}
							<select
								value={jlptFilter}
								onChange={(e) => setJlptFilter(e.target.value)}
							>
								{GRAMMAR_JLPT_LEVELS.map((lv) => (
									<option key={lv} value={lv}>
										{lv}
									</option>
								))}
							</select>
						</label>
					</div>

					{dataPanelKind === 'kanji' ? (
						<>
							<h2 className="admin-arena-panel-title">
								{games.find((g) => g.gameKey === 'kanji_rain')?.titleVi ||
									t('adminArena.kanjiTitle')}
							</h2>
							<ul className="admin-arena-data-list">
								{kanjiList.map((row) => (
									<li key={row._id} className="admin-arena-data-item">
										<div className="admin-arena-data-row">
											<span className={row.isActive === false ? 'admin-arena-row-off' : ''}>
												<strong>{row.char}</strong> — {row.hanViet}
												{row.jlpt ? ` · ${row.jlpt}` : ''}
											</span>
											<div className="admin-arena-row-actions">
												<ActiveSwitch
													checked={row.isActive !== false}
													label={t('adminArena.active')}
													onChange={(next) =>
														void toggleActive(updateAdminKanji, row._id, next)
													}
												/>
												<button
													type="button"
													className="admin-arena-btn admin-arena-btn--ghost admin-arena-btn--sm"
													onClick={() => {
														setEditKanjiId(row._id);
														setKanjiEdit({
															char: row.char,
															hanViet: row.hanViet,
															onYomi: row.onYomi || '',
															kunYomi: row.kunYomi || '',
															jlpt: row.jlpt || jlptFilter,
														});
													}}
												>
													{t('adminArena.edit')}
												</button>
												<button
													type="button"
													className="admin-arena-btn admin-arena-btn--ghost admin-arena-btn--sm admin-arena-btn--danger"
													onClick={() =>
														void handleDelete(deleteAdminKanji, row._id, () => {
															setEditKanjiId(null);
															setKanjiEdit(null);
														})
													}
												>
													{t('adminArena.delete')}
												</button>
											</div>
										</div>
										{editKanjiId === row._id && kanjiEdit ? (
											<form
												className="admin-arena-edit-form admin-arena-form-grid"
												onSubmit={async (e) => {
													e.preventDefault();
													try {
														await updateAdminKanji(row._id, kanjiEdit);
														toast.success(t('adminArena.itemUpdated'));
														setEditKanjiId(null);
														setKanjiEdit(null);
														void loadDataTab();
														void loadDashboard();
													} catch (err) {
														toast.error(getAxiosErrorMessage(err, t));
													}
												}}
											>
												<label>
													Kanji
													<input
														value={kanjiEdit.char}
														onChange={(e) =>
															setKanjiEdit((d) => ({ ...d, char: e.target.value }))
														}
													/>
												</label>
												<label>
													{t('adminArena.hanViet')}
													<input
														value={kanjiEdit.hanViet}
														onChange={(e) =>
															setKanjiEdit((d) => ({
																...d,
																hanViet: e.target.value,
															}))
														}
													/>
												</label>
												<label>
													On
													<input
														value={kanjiEdit.onYomi}
														onChange={(e) =>
															setKanjiEdit((d) => ({
																...d,
																onYomi: e.target.value,
															}))
														}
													/>
												</label>
												<label>
													Kun
													<input
														value={kanjiEdit.kunYomi}
														onChange={(e) =>
															setKanjiEdit((d) => ({
																...d,
																kunYomi: e.target.value,
															}))
														}
													/>
												</label>
												<label>
													JLPT
													<select
														value={kanjiEdit.jlpt}
														onChange={(e) =>
															setKanjiEdit((d) => ({
																...d,
																jlpt: e.target.value,
															}))
														}
													>
														{GRAMMAR_JLPT_LEVELS.map((lv) => (
															<option key={lv} value={lv}>
																{lv}
															</option>
														))}
													</select>
												</label>
												<div className="admin-arena-edit-actions">
													<button type="submit" className="admin-arena-btn">
														{t('adminArena.save')}
													</button>
													<button
														type="button"
														className="admin-arena-btn admin-arena-btn--ghost"
														onClick={() => {
															setEditKanjiId(null);
															setKanjiEdit(null);
														}}
													>
														{t('adminArena.cancel')}
													</button>
												</div>
											</form>
										) : null}
									</li>
								))}
							</ul>
							<div className="admin-arena-import">
								<p className="admin-arena-import-hint">{t('adminArena.kanjiImportHint')}</p>
								<textarea
									value={kanjiJson}
									onChange={(e) => setKanjiJson(e.target.value)}
									spellCheck={false}
								/>
								<button
									type="button"
									className="admin-arena-btn"
									onClick={() => void handleKanjiImport()}
								>
									{t('adminArena.kanjiImportBtn')}
								</button>
							</div>
						</>
					) : null}

					{dataPanelKind === 'vocab' ? (
						<>
							<h2 className="admin-arena-panel-title">
								{currentDataTab?.vocabGames?.map((g) => g.titleVi).join(' · ') ||
									t('adminArena.vocabTitle')}
							</h2>
							{currentDataTab?.vocabGames?.some((g) => g.gameKey === 'reading_rush') ? (
								<p className="admin-arena-lead">{t('adminArena.readingVocabNote')}</p>
							) : null}
							{currentDataTab?.vocabGames?.some((g) => g.gameKey === 'meaning_rush') ? (
								<p className="admin-arena-lead">{t('adminArena.meaningVocabNote')}</p>
							) : null}
							<ul className="admin-arena-data-list">
								{vocabList.map((row) => (
									<li key={row._id} className="admin-arena-data-item">
										<div className="admin-arena-data-row">
											<span className={row.isActive === false ? 'admin-arena-row-off' : ''}>
												<strong>{row.wordJa}</strong>
												{row.reading ? ` (${row.reading})` : ''}
											</span>
											<div className="admin-arena-row-actions">
												<ActiveSwitch
													checked={row.isActive !== false}
													label={t('adminArena.active')}
													onChange={(next) =>
														void toggleActive(updateAdminVocab, row._id, next)
													}
												/>
												<button
													type="button"
													className="admin-arena-btn admin-arena-btn--ghost admin-arena-btn--sm"
													onClick={() => {
														setEditVocabId(row._id);
														setVocabEdit({
															wordJa: row.wordJa,
															reading: row.reading || '',
															choices: [...(row.choices || ['', '', '', ''])],
															answerIndex: row.answerIndex ?? 0,
															jlpt: row.jlpt || jlptFilter,
														});
													}}
												>
													{t('adminArena.edit')}
												</button>
												<button
													type="button"
													className="admin-arena-btn admin-arena-btn--ghost admin-arena-btn--sm admin-arena-btn--danger"
													onClick={() =>
														void handleDelete(deleteAdminVocab, row._id, () => {
															setEditVocabId(null);
															setVocabEdit(null);
														})
													}
												>
													{t('adminArena.delete')}
												</button>
											</div>
										</div>
										{editVocabId === row._id && vocabEdit ? (
											<form
												className="admin-arena-edit-form admin-arena-form-grid"
												onSubmit={async (e) => {
													e.preventDefault();
													const choices = vocabEdit.choices
														.map((c) => c.trim())
														.filter(Boolean);
													if (!vocabEdit.wordJa.trim() || choices.length < 2) {
														toast.error(t('adminArena.vocabInvalid'));
														return;
													}
													try {
														await updateAdminVocab(row._id, {
															...vocabEdit,
															choices,
															answerIndex: Number(vocabEdit.answerIndex),
														});
														toast.success(t('adminArena.itemUpdated'));
														setEditVocabId(null);
														setVocabEdit(null);
														void loadDataTab();
														void loadDashboard();
													} catch (err) {
														toast.error(getAxiosErrorMessage(err, t));
													}
												}}
											>
												<label>
													{t('adminArena.wordJa')}
													<input
														value={vocabEdit.wordJa}
														onChange={(e) =>
															setVocabEdit((d) => ({
																...d,
																wordJa: e.target.value,
															}))
														}
													/>
												</label>
												<label>
													{t('adminArena.reading')}
													<input
														value={vocabEdit.reading}
														onChange={(e) =>
															setVocabEdit((d) => ({
																...d,
																reading: e.target.value,
															}))
														}
													/>
												</label>
												{vocabEdit.choices.map((c, i) => (
													<label key={`ve-${i}`}>
														{t('adminArena.choiceN', { n: i + 1 })}
														<input
															value={c}
															onChange={(e) => {
																const next = [...vocabEdit.choices];
																next[i] = e.target.value;
																setVocabEdit((d) => ({ ...d, choices: next }));
															}}
														/>
													</label>
												))}
												<label>
													{t('adminArena.answerIndex')}
													<input
														type="number"
														min={0}
														max={3}
														value={vocabEdit.answerIndex}
														onChange={(e) =>
															setVocabEdit((d) => ({
																...d,
																answerIndex: Number(e.target.value),
															}))
														}
													/>
												</label>
												<div className="admin-arena-edit-actions">
													<button type="submit" className="admin-arena-btn">
														{t('adminArena.save')}
													</button>
													<button
														type="button"
														className="admin-arena-btn admin-arena-btn--ghost"
														onClick={() => {
															setEditVocabId(null);
															setVocabEdit(null);
														}}
													>
														{t('adminArena.cancel')}
													</button>
												</div>
											</form>
										) : null}
									</li>
								))}
							</ul>
							<div className="admin-arena-import">
								<p className="admin-arena-import-hint">{t('adminArena.vocabImportHint')}</p>
								<textarea
									value={vocabJson}
									onChange={(e) => setVocabJson(e.target.value)}
									spellCheck={false}
								/>
								<button
									type="button"
									className="admin-arena-btn"
									onClick={() => void handleVocabImport()}
								>
									{t('adminArena.vocabImportBtn')}
								</button>
							</div>
						</>
					) : null}

					{dataPanelKind === 'particle' ? (
						<>
							<h2 className="admin-arena-panel-title">
								{games.find((g) => g.gameKey === 'particle_quiz')?.titleVi ||
									t('adminArena.particleTitle')}
							</h2>
							<ul className="admin-arena-data-list">
								{particleList.map((row) => (
									<li key={row._id} className="admin-arena-data-item">
										<div className="admin-arena-data-row">
											<span className={row.isActive === false ? 'admin-arena-row-off' : ''}>
												<strong>{row.sentenceJa}</strong>
												{row.answer ? ` → ${row.answer}` : ''}
											</span>
											<div className="admin-arena-row-actions">
												<ActiveSwitch
													checked={row.isActive !== false}
													label={t('adminArena.active')}
													onChange={(next) =>
														void toggleActive(updateAdminParticle, row._id, next)
													}
												/>
												<button
													type="button"
													className="admin-arena-btn admin-arena-btn--ghost admin-arena-btn--sm"
													onClick={() => {
														setEditParticleId(row._id);
														setParticleEdit({
															sentenceJa: row.sentenceJa,
															sentenceVi: row.sentenceVi || '',
															answer: row.answer,
															jlpt: row.jlpt || jlptFilter,
														});
													}}
												>
													{t('adminArena.edit')}
												</button>
												<button
													type="button"
													className="admin-arena-btn admin-arena-btn--ghost admin-arena-btn--sm admin-arena-btn--danger"
													onClick={() =>
														void handleDelete(deleteAdminParticle, row._id, () => {
															setEditParticleId(null);
															setParticleEdit(null);
														})
													}
												>
													{t('adminArena.delete')}
												</button>
											</div>
										</div>
										{editParticleId === row._id && particleEdit ? (
											<form
												className="admin-arena-edit-form admin-arena-form-grid"
												onSubmit={async (e) => {
													e.preventDefault();
													if (
														!particleEdit.sentenceJa.trim() ||
														!particleEdit.answer.trim()
													) {
														toast.error(t('adminArena.particleInvalid'));
														return;
													}
													try {
														await updateAdminParticle(row._id, particleEdit);
														toast.success(t('adminArena.itemUpdated'));
														setEditParticleId(null);
														setParticleEdit(null);
														void loadDataTab();
														void loadDashboard();
													} catch (err) {
														toast.error(getAxiosErrorMessage(err, t));
													}
												}}
											>
												<label style={{ gridColumn: '1 / -1' }}>
													{t('adminArena.sentenceJa')}
													<input
														value={particleEdit.sentenceJa}
														onChange={(e) =>
															setParticleEdit((d) => ({
																...d,
																sentenceJa: e.target.value,
															}))
														}
													/>
												</label>
												<label style={{ gridColumn: '1 / -1' }}>
													{t('adminArena.sentenceVi')}
													<input
														value={particleEdit.sentenceVi}
														onChange={(e) =>
															setParticleEdit((d) => ({
																...d,
																sentenceVi: e.target.value,
															}))
														}
													/>
												</label>
												<label>
													{t('adminArena.particleAnswer')}
													<input
														value={particleEdit.answer}
														onChange={(e) =>
															setParticleEdit((d) => ({
																...d,
																answer: e.target.value,
															}))
														}
													/>
												</label>
												<div className="admin-arena-edit-actions">
													<button type="submit" className="admin-arena-btn">
														{t('adminArena.save')}
													</button>
													<button
														type="button"
														className="admin-arena-btn admin-arena-btn--ghost"
														onClick={() => {
															setEditParticleId(null);
															setParticleEdit(null);
														}}
													>
														{t('adminArena.cancel')}
													</button>
												</div>
											</form>
										) : null}
									</li>
								))}
							</ul>
							<div className="admin-arena-import">
								<p className="admin-arena-import-hint">
									{t('adminArena.particleImportHint')}
								</p>
								<textarea
									value={particleJson}
									onChange={(e) => setParticleJson(e.target.value)}
									spellCheck={false}
								/>
								<button
									type="button"
									className="admin-arena-btn"
									onClick={() => void handleParticleImport()}
								>
									{t('adminArena.particleImportBtn')}
								</button>
							</div>
						</>
					) : null}
				</section>
			) : null}
		</div>
	);
}

function formatScheduleWeekdays(days, t) {
	const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	return (days ?? [6])
		.slice()
		.sort((a, b) => a - b)
		.map((d) => t(`arenaPage.weekday.${keys[d] ?? 'sat'}`))
		.join(', ');
}

function ActiveSwitch({ checked, onChange, disabled, label }) {
	return (
		<div className="admin-grammar-switch-wrap">
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				disabled={disabled}
				className={`admin-grammar-switch${checked ? ' admin-grammar-switch--on' : ''}`}
				onClick={() => !disabled && onChange(!checked)}
			>
				<span className="admin-grammar-switch-thumb" aria-hidden />
			</button>
			{label ? <span className="admin-grammar-switch-caption">{label}</span> : null}
		</div>
	);
}
