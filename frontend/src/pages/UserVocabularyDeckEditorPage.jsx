import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useJlptAccess } from '../hooks/useJlptAccess.js';
import {
	createMyVocabularyWord,
	deleteMyVocabularyWord,
	getMyVocabularyDeckWithWords,
	importMyVocabularyWords,
	updateMyVocabularyDeck,
	updateMyVocabularyWord,
} from '../services/userVocabularyDeckService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { JLPT_ORDER, jlptToApiLevel, levelToJlpt } from '../utils/deckStudy.js';
import './DashboardHome.css';
import './VocabularyPages.css';
import './GrammarPages.css';

const MAX_WORDS = 25;

const emptyWord = () => ({
	word: '',
	reading: '',
	meaning: '',
	meaningJa: '',
	example: '',
	exampleMeaning: '',
	partOfSpeech: 'noun',
});

/**
 * @param {unknown} raw
 */
function normalizeImportItem(raw) {
	if (!raw || typeof raw !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (raw);
	const word = String(o.word ?? '').trim();
	const reading = String(o.reading ?? '').trim();
	const meaning = String(o.meaning ?? o.meaningVi ?? '').trim();
	if (!word || !reading || !meaning) return null;
	return {
		word,
		reading,
		meaning,
		meaningJa: String(o.meaningJa ?? '').trim() || undefined,
		example: String(o.example ?? o.exampleSentence ?? '').trim() || undefined,
		exampleMeaning: String(o.exampleMeaning ?? '').trim() || undefined,
		partOfSpeech:
			typeof o.partOfSpeech === 'string' && o.partOfSpeech.trim()
				? o.partOfSpeech.trim()
				: 'noun',
	};
}

function parseImportJson(text) {
	const trimmed = text.trim();
	if (!trimmed) throw new Error('empty');
	let parsed;
	try {
		parsed = JSON.parse(trimmed);
	} catch {
		throw new Error('invalid');
	}
	const list = Array.isArray(parsed)
		? parsed
		: parsed && typeof parsed === 'object' && Array.isArray(parsed.vocabularyList)
			? parsed.vocabularyList
			: null;
	if (!list) throw new Error('shape');
	return list.map(normalizeImportItem).filter(Boolean);
}

export default function UserVocabularyDeckEditorPage() {
	const { deckId } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isLocked } = useJlptAccess();

	const [loading, setLoading] = useState(true);
	const [deck, setDeck] = useState(null);
	const [words, setWords] = useState([]);
	const [meta, setMeta] = useState({
		title: '',
		titleJa: '',
		description: '',
		level: 'n5',
	});
	const [wordForm, setWordForm] = useState(emptyWord);
	const [editingId, setEditingId] = useState(null);
	const [savingMeta, setSavingMeta] = useState(false);
	const [savingWord, setSavingWord] = useState(false);
	const [importOpen, setImportOpen] = useState(false);
	const [importText, setImportText] = useState('');

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	const wordCount = words.length;
	const atWordLimit = wordCount >= MAX_WORDS;

	const fetchDeck = useCallback(async () => {
		if (!deckId) return;
		setLoading(true);
		try {
			const data = await getMyVocabularyDeckWithWords(deckId);
			setDeck(data.deck);
			setWords(data.vocabulary ?? []);
			setMeta({
				title: data.deck?.title ?? '',
				titleJa: data.deck?.titleJa ?? '',
				description: data.deck?.description ?? '',
				level: data.deck?.level ?? 'n5',
			});
		} catch (e) {
			toast.error(getApiErrorMessage(e, t));
			navigate('/vocabulary/mine');
		} finally {
			setLoading(false);
		}
	}, [deckId, navigate, t]);

	useEffect(() => {
		void fetchDeck();
	}, [fetchDeck]);

	const studyHref = useMemo(() => {
		if (!deck) return '/vocabulary/mine';
		const jlpt = levelToJlpt(deck.level);
		return `/vocabulary/lesson/1?deckId=${encodeURIComponent(deck._id)}&jlpt=${encodeURIComponent(jlpt)}&userDeck=1`;
	}, [deck]);

	const resetWordForm = () => {
		setWordForm(emptyWord());
		setEditingId(null);
	};

	const handleSaveMeta = async (e) => {
		e.preventDefault();
		if (!deckId) return;
		const lv = levelToJlpt(meta.level);
		if (isLocked(lv)) {
			toast.error(t('vocabPage.userDeckJlptLocked', { level: lv }));
			return;
		}
		setSavingMeta(true);
		try {
			const updated = await updateMyVocabularyDeck(deckId, {
				title: meta.title.trim(),
				titleJa: meta.titleJa.trim(),
				description: meta.description.trim(),
				level: meta.level,
			});
			setDeck(updated);
			toast.success(t('vocabPage.userDeckMetaSaved'));
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setSavingMeta(false);
		}
	};

	const handleSaveWord = async (e) => {
		e.preventDefault();
		if (!deckId) return;
		if (!editingId && atWordLimit) {
			toast.error(t('vocabPage.userDeckWordLimit', { max: MAX_WORDS }));
			return;
		}
		const payload = {
			word: wordForm.word.trim(),
			reading: wordForm.reading.trim(),
			meaning: wordForm.meaning.trim(),
			meaningJa: wordForm.meaningJa.trim() || undefined,
			example: wordForm.example.trim() || undefined,
			exampleMeaning: wordForm.exampleMeaning.trim() || undefined,
			partOfSpeech: wordForm.partOfSpeech,
		};
		setSavingWord(true);
		try {
			if (editingId) {
				await updateMyVocabularyWord(editingId, payload);
				toast.success(t('vocabPage.userDeckWordUpdated'));
			} else {
				await createMyVocabularyWord(deckId, payload);
				toast.success(t('vocabPage.userDeckWordAdded'));
			}
			resetWordForm();
			void fetchDeck();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setSavingWord(false);
		}
	};

	const startEditWord = (row) => {
		setEditingId(row._id);
		setWordForm({
			word: row.word ?? '',
			reading: row.reading ?? '',
			meaning: row.meaning ?? '',
			meaningJa: row.meaningJa ?? '',
			example: row.example ?? '',
			exampleMeaning: row.exampleMeaning ?? '',
			partOfSpeech: row.partOfSpeech ?? 'noun',
		});
	};

	const handleDeleteWord = async (id) => {
		if (!window.confirm(t('vocabPage.userDeckWordDeleteConfirm'))) return;
		try {
			await deleteMyVocabularyWord(id);
			toast.success(t('vocabPage.userDeckWordDeleted'));
			if (editingId === id) resetWordForm();
			void fetchDeck();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		}
	};

	const handleImport = async () => {
		if (!deckId) return;
		let items;
		try {
			items = parseImportJson(importText);
		} catch (err) {
			const key =
				err instanceof Error && err.message === 'empty'
					? 'vocabPage.userDeckImportEmpty'
					: err instanceof Error && err.message === 'invalid'
						? 'vocabPage.userDeckImportInvalid'
						: 'vocabPage.userDeckImportShape';
			toast.error(t(key));
			return;
		}
		if (!items.length) {
			toast.error(t('vocabPage.userDeckImportNoRows'));
			return;
		}
		const room = MAX_WORDS - wordCount;
		if (items.length > room) {
			toast.error(t('vocabPage.userDeckImportTooMany', { room, max: MAX_WORDS }));
			return;
		}
		try {
			await importMyVocabularyWords(deckId, items);
			toast.success(t('vocabPage.userDeckImportDone', { count: items.length }));
			setImportOpen(false);
			setImportText('');
			void fetchDeck();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		}
	};

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
					{ label: t('breadcrumb.vocabulary'), to: '/vocabulary/browse' },
					{ label: t('vocabPage.userDeckTitle'), to: '/vocabulary/mine' },
					{ label: meta.title || t('vocabPage.userDeckEdit') },
				]}
			/>

			<article className="vocab-sheet vocab-scope vocab-notebook user-vocab-editor">
				<header className="user-vocab-mine-head">
					<div>
						<h1 className="vocab-lesson-title">{meta.title}</h1>
						<p className="vocab-lesson-sub">
							{t('vocabPage.userDeckWordCount', { count: wordCount })} / {MAX_WORDS}
						</p>
					</div>
					<div className="user-vocab-mine-actions">
						<Link to="/vocabulary/mine" className="admin-grammar-btn admin-grammar-btn--ghost">
							{t('vocabPage.userDeckBackList')}
						</Link>
						<Link to={studyHref} className="admin-grammar-btn admin-grammar-btn--primary">
							{t('vocabPage.userDeckStudy')}
						</Link>
					</div>
				</header>

				<section className="user-vocab-editor-section">
					<h2 className="user-vocab-editor-h2">{t('vocabPage.userDeckSectionMeta')}</h2>
					<form className="user-vocab-meta-form" onSubmit={(e) => void handleSaveMeta(e)}>
						<label className="admin-grammar-field">
							<span className="admin-grammar-label">{t('vocabPage.userDeckFormTitle')}</span>
							<input
								className="admin-grammar-input"
								value={meta.title}
								onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
								required
							/>
						</label>
						<label className="admin-grammar-field">
							<span className="admin-grammar-label">{t('vocabPage.userDeckFormTitleJa')}</span>
							<input
								className="admin-grammar-input"
								value={meta.titleJa}
								onChange={(e) => setMeta((m) => ({ ...m, titleJa: e.target.value }))}
								lang="ja"
							/>
						</label>
						<label className="admin-grammar-field">
							<span className="admin-grammar-label">JLPT</span>
							<select
								className="admin-grammar-select"
								value={meta.level}
								onChange={(e) => setMeta((m) => ({ ...m, level: e.target.value }))}
							>
								{JLPT_ORDER.map((lv) => {
									const apiLv = jlptToApiLevel(lv);
									const locked = isLocked(lv);
									return (
										<option key={lv} value={apiLv} disabled={locked}>
											{lv}
											{locked ? ` (${t('vocabPage.badgeJlptLocked', { level: lv })})` : ''}
										</option>
									);
								})}
							</select>
						</label>
						<label className="admin-grammar-field">
							<span className="admin-grammar-label">{t('vocabPage.userDeckFormDesc')}</span>
							<textarea
								className="admin-grammar-textarea"
								rows={2}
								value={meta.description}
								onChange={(e) =>
									setMeta((m) => ({ ...m, description: e.target.value }))
								}
							/>
						</label>
						<button
							type="submit"
							className="admin-grammar-btn admin-grammar-btn--primary"
							disabled={savingMeta}
						>
							{savingMeta ? t('profile.saving') : t('profile.save')}
						</button>
					</form>
				</section>

				<section className="user-vocab-editor-section">
					<div className="user-vocab-editor-section-head">
						<h2 className="user-vocab-editor-h2">{t('vocabPage.userDeckSectionWords')}</h2>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={() => setImportOpen(true)}
							disabled={atWordLimit}
						>
							{t('vocabPage.userDeckImportJson')}
						</button>
					</div>

					{words.length > 0 ? (
						<ul className="user-vocab-word-list">
							{words.map((row) => (
								<li key={row._id} className="user-vocab-word-row">
									<div>
										<strong lang="ja">{row.word}</strong>
										<span className="user-vocab-word-reading"> · {row.reading}</span>
										<p>{row.meaning}</p>
									</div>
									<div className="user-vocab-word-row-actions">
										<button
											type="button"
											className="admin-grammar-btn admin-grammar-btn--ghost"
											onClick={() => startEditWord(row)}
										>
											{t('vocabPage.userDeckEdit')}
										</button>
										<button
											type="button"
											className="admin-grammar-btn admin-grammar-btn--ghost"
											onClick={() => void handleDeleteWord(row._id)}
										>
											{t('vocabPage.userDeckDelete')}
										</button>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="vocab-empty">{t('vocabPage.userDeckNoWords')}</p>
					)}

					<form className="user-vocab-word-form" onSubmit={(e) => void handleSaveWord(e)}>
						<h3 className="user-vocab-editor-h3">
							{editingId
								? t('vocabPage.userDeckEditWord')
								: t('vocabPage.userDeckAddWord')}
						</h3>
						<div className="user-vocab-word-form-grid">
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('vocabPage.userDeckFieldWord')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.word}
									onChange={(e) => setWordForm((f) => ({ ...f, word: e.target.value }))}
									lang="ja"
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('vocabPage.userDeckFieldReading')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.reading}
									onChange={(e) => setWordForm((f) => ({ ...f, reading: e.target.value }))}
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('vocabPage.userDeckFieldMeaning')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.meaning}
									onChange={(e) => setWordForm((f) => ({ ...f, meaning: e.target.value }))}
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('vocabPage.userDeckFieldExample')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.example}
									onChange={(e) => setWordForm((f) => ({ ...f, example: e.target.value }))}
									lang="ja"
								/>
							</label>
						</div>
						<div className="user-vocab-mine-actions">
							{editingId ? (
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--ghost"
									onClick={resetWordForm}
								>
									{t('profile.cancel')}
								</button>
							) : null}
							<button
								type="submit"
								className="admin-grammar-btn admin-grammar-btn--primary"
								disabled={savingWord || (!editingId && atWordLimit)}
							>
								{savingWord ? t('profile.saving') : t('profile.save')}
							</button>
						</div>
					</form>
				</section>
			</article>

			{importOpen ? (
				<div
					className="admin-grammar-modal-backdrop"
					role="presentation"
					onClick={() => setImportOpen(false)}
				>
					<div
						className="admin-grammar-modal admin-grammar-modal--wide"
						role="dialog"
						aria-modal="true"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="admin-grammar-modal-header">
							<h2 className="admin-grammar-modal-title">
								{t('vocabPage.userDeckImportJson')}
							</h2>
							<button
								type="button"
								className="admin-grammar-modal-close"
								onClick={() => setImportOpen(false)}
							>
								×
							</button>
						</div>
						<div className="admin-grammar-modal-body">
							<p className="user-vocab-import-hint">{t('vocabPage.userDeckImportHint')}</p>
							<textarea
								className="admin-grammar-textarea"
								rows={12}
								value={importText}
								onChange={(e) => setImportText(e.target.value)}
								placeholder='[{"word":"学校","reading":"がっこう","meaning":"trường học"}]'
							/>
						</div>
						<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
							<button
								type="button"
								className="admin-grammar-btn admin-grammar-btn--ghost"
								onClick={() => setImportOpen(false)}
							>
								{t('profile.cancel')}
							</button>
							<button
								type="button"
								className="admin-grammar-btn admin-grammar-btn--primary"
								onClick={() => void handleImport()}
							>
								{t('vocabPage.userDeckImportRun')}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</Layout>
	);
}
