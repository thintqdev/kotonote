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
	createMyKanji,
	deleteMyKanji,
	getMyKanjiDeckWithKanji,
	importMyKanji,
	updateMyKanjiDeck,
	updateMyKanji,
} from '../services/userKanjiDeckService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { JLPT_ORDER } from '../utils/deckStudy.js';
import './DashboardHome.css';
import './VocabularyPages.css';
import './GrammarPages.css';

const MAX_KANJI = 25;

const emptyKanji = () => ({
	char: '',
	onYomi: '',
	kunYomi: '—',
	hanViet: '',
	meaningVi: '',
	vocabJa: '',
	exampleJa: '',
	exampleVi: '',
});

/**
 * @param {unknown} raw
 */
function normalizeImportKanji(raw) {
	if (!raw || typeof raw !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (raw);
	const char = String(o.char ?? '').trim();
	const onYomi = String(o.onYomi ?? '').trim();
	const hanViet = String(o.hanViet ?? '').trim();
	const meaningVi = String(o.meaningVi ?? '').trim();
	const vocabJa = String(o.vocabJa ?? '').trim();
	const exampleJa = String(o.exampleJa ?? '').trim();
	const exampleVi = String(o.exampleVi ?? '').trim();
	if (!char || !onYomi || !hanViet || !meaningVi || !vocabJa || !exampleJa || !exampleVi) {
		return null;
	}
	return {
		char,
		onYomi,
		kunYomi: String(o.kunYomi ?? '—').trim() || '—',
		hanViet,
		meaningVi,
		vocabJa,
		exampleJa,
		exampleVi,
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
		: parsed && typeof parsed === 'object' && Array.isArray(parsed.kanjiList)
			? parsed.kanjiList
			: null;
	if (!list) throw new Error('shape');
	return list.map(normalizeImportKanji).filter(Boolean);
}

export default function UserKanjiDeckEditorPage() {
	const { deckId } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isLocked } = useJlptAccess();

	const [loading, setLoading] = useState(true);
	const [kanji, setKanji] = useState([]);
	const [meta, setMeta] = useState({
		titleVi: '',
		titleJa: '',
		descriptionVi: '',
		jlpt: 'N5',
	});
	const [wordForm, setWordForm] = useState(emptyKanji);
	const [editingId, setEditingId] = useState(null);
	const [savingMeta, setSavingMeta] = useState(false);
	const [savingKanji, setSavingKanji] = useState(false);
	const [importOpen, setImportOpen] = useState(false);
	const [importText, setImportText] = useState('');

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	const kanjiCount = kanji.length;
	const atLimit = kanjiCount >= MAX_KANJI;

	const fetchDeck = useCallback(async () => {
		if (!deckId) return;
		setLoading(true);
		try {
			const data = await getMyKanjiDeckWithKanji(deckId);
			setKanji(data.kanji ?? []);
			setMeta({
				titleVi: data.deck?.titleVi ?? '',
				titleJa: data.deck?.titleJa ?? '',
				descriptionVi: data.deck?.descriptionVi ?? '',
				jlpt: data.deck?.jlpt ?? 'N5',
			});
		} catch (e) {
			toast.error(getApiErrorMessage(e, t));
			navigate('/kanji/mine');
		} finally {
			setLoading(false);
		}
	}, [deckId, navigate, t]);

	useEffect(() => {
		void fetchDeck();
	}, [fetchDeck]);

	const studyHref = useMemo(() => {
		if (!deckId) return '/kanji/mine';
		return `/kanji/lesson/1?deckId=${encodeURIComponent(deckId)}&jlpt=${encodeURIComponent(meta.jlpt)}&userDeck=1`;
	}, [deckId, meta.jlpt]);

	const resetForm = () => {
		setWordForm(emptyKanji());
		setEditingId(null);
	};

	const handleSaveMeta = async (e) => {
		e.preventDefault();
		if (!deckId) return;
		if (isLocked(meta.jlpt)) {
			toast.error(t('kanjiPage.userDeckJlptLocked', { level: meta.jlpt }));
			return;
		}
		setSavingMeta(true);
		try {
			await updateMyKanjiDeck(deckId, {
				titleVi: meta.titleVi.trim(),
				titleJa: meta.titleJa.trim(),
				descriptionVi: meta.descriptionVi.trim(),
				jlpt: meta.jlpt,
			});
			toast.success(t('kanjiPage.userDeckMetaSaved'));
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setSavingMeta(false);
		}
	};

	const handleSaveKanji = async (e) => {
		e.preventDefault();
		if (!deckId) return;
		if (!editingId && atLimit) {
			toast.error(t('kanjiPage.userDeckKanjiLimit', { max: MAX_KANJI }));
			return;
		}
		const payload = {
			char: wordForm.char.trim(),
			onYomi: wordForm.onYomi.trim(),
			kunYomi: wordForm.kunYomi.trim() || '—',
			hanViet: wordForm.hanViet.trim(),
			meaningVi: wordForm.meaningVi.trim(),
			vocabJa: wordForm.vocabJa.trim(),
			exampleJa: wordForm.exampleJa.trim(),
			exampleVi: wordForm.exampleVi.trim(),
		};
		setSavingKanji(true);
		try {
			if (editingId) {
				await updateMyKanji(editingId, payload);
				toast.success(t('kanjiPage.userDeckKanjiUpdated'));
			} else {
				await createMyKanji(deckId, payload);
				toast.success(t('kanjiPage.userDeckKanjiAdded'));
			}
			resetForm();
			void fetchDeck();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setSavingKanji(false);
		}
	};

	const startEdit = (row) => {
		setEditingId(row._id);
		setWordForm({
			char: row.char ?? '',
			onYomi: row.onYomi ?? '',
			kunYomi: row.kunYomi ?? '—',
			hanViet: row.hanViet ?? '',
			meaningVi: row.meaningVi ?? '',
			vocabJa: row.vocabJa ?? '',
			exampleJa: row.exampleJa ?? '',
			exampleVi: row.exampleVi ?? '',
		});
	};

	const handleDeleteKanji = async (id) => {
		if (!window.confirm(t('kanjiPage.userDeckKanjiDeleteConfirm'))) return;
		try {
			await deleteMyKanji(id);
			toast.success(t('kanjiPage.userDeckKanjiDeleted'));
			if (editingId === id) resetForm();
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
					? 'kanjiPage.userDeckImportEmpty'
					: err instanceof Error && err.message === 'invalid'
						? 'kanjiPage.userDeckImportInvalid'
						: 'kanjiPage.userDeckImportShape';
			toast.error(t(key));
			return;
		}
		if (!items.length) {
			toast.error(t('kanjiPage.userDeckImportNoRows'));
			return;
		}
		const room = MAX_KANJI - kanjiCount;
		if (items.length > room) {
			toast.error(t('kanjiPage.userDeckImportTooMany', { room, max: MAX_KANJI }));
			return;
		}
		try {
			await importMyKanji(deckId, items);
			toast.success(t('kanjiPage.userDeckImportDone', { count: items.length }));
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
					{ label: t('breadcrumb.kanji'), to: '/kanji/browse' },
					{ label: t('kanjiPage.userDeckTitle'), to: '/kanji/mine' },
					{ label: meta.titleVi || t('kanjiPage.userDeckEdit') },
				]}
			/>

			<article className="vocab-sheet vocab-scope vocab-notebook user-vocab-editor">
				<header className="user-vocab-mine-head">
					<div>
						<h1 className="vocab-lesson-title">{meta.titleVi}</h1>
						<p className="vocab-lesson-sub">
							{t('kanjiPage.userDeckKanjiCount', { count: kanjiCount })} / {MAX_KANJI}
						</p>
					</div>
					<div className="user-vocab-mine-actions">
						<Link to="/kanji/mine" className="admin-grammar-btn admin-grammar-btn--ghost">
							{t('kanjiPage.userDeckBackList')}
						</Link>
						<Link to={studyHref} className="admin-grammar-btn admin-grammar-btn--primary">
							{t('kanjiPage.userDeckStudy')}
						</Link>
					</div>
				</header>

				<section className="user-vocab-editor-section">
					<h2 className="user-vocab-editor-h2">{t('kanjiPage.userDeckSectionMeta')}</h2>
					<form className="user-vocab-meta-form" onSubmit={(e) => void handleSaveMeta(e)}>
						<label className="admin-grammar-field">
							<span className="admin-grammar-label">{t('kanjiPage.userDeckFormTitleVi')}</span>
							<input
								className="admin-grammar-input"
								value={meta.titleVi}
								onChange={(e) => setMeta((m) => ({ ...m, titleVi: e.target.value }))}
								required
							/>
						</label>
						<label className="admin-grammar-field">
							<span className="admin-grammar-label">{t('kanjiPage.userDeckFormTitleJa')}</span>
							<input
								className="admin-grammar-input"
								value={meta.titleJa}
								onChange={(e) => setMeta((m) => ({ ...m, titleJa: e.target.value }))}
								lang="ja"
								required
							/>
						</label>
						<label className="admin-grammar-field">
							<span className="admin-grammar-label">JLPT</span>
							<select
								className="admin-grammar-select"
								value={meta.jlpt}
								onChange={(e) => setMeta((m) => ({ ...m, jlpt: e.target.value }))}
							>
								{JLPT_ORDER.map((lv) => (
									<option key={lv} value={lv} disabled={isLocked(lv)}>
										{lv}
										{isLocked(lv)
											? ` (${t('jlptAccess.cardLocked')})`
											: ''}
									</option>
								))}
							</select>
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
						<h2 className="user-vocab-editor-h2">{t('kanjiPage.userDeckSectionKanji')}</h2>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={() => setImportOpen(true)}
							disabled={atLimit}
						>
							{t('kanjiPage.userDeckImportJson')}
						</button>
					</div>

					{kanji.length > 0 ? (
						<ul className="user-vocab-word-list">
							{kanji.map((row) => (
								<li key={row._id} className="user-vocab-word-row">
									<div>
										<strong lang="ja" className="user-kanji-char">
											{row.char}
										</strong>
										<span className="user-vocab-word-reading">
											{' '}
											· {row.onYomi} / {row.kunYomi}
										</span>
										<p>{row.meaningVi}</p>
									</div>
									<div className="user-vocab-word-row-actions">
										<button
											type="button"
											className="admin-grammar-btn admin-grammar-btn--ghost"
											onClick={() => startEdit(row)}
										>
											{t('kanjiPage.userDeckEdit')}
										</button>
										<button
											type="button"
											className="admin-grammar-btn admin-grammar-btn--ghost"
											onClick={() => void handleDeleteKanji(row._id)}
										>
											{t('kanjiPage.userDeckDelete')}
										</button>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="vocab-empty">{t('kanjiPage.userDeckNoKanji')}</p>
					)}

					<form className="user-vocab-word-form" onSubmit={(e) => void handleSaveKanji(e)}>
						<h3 className="user-vocab-editor-h3">
							{editingId
								? t('kanjiPage.userDeckEditKanji')
								: t('kanjiPage.userDeckAddKanji')}
						</h3>
						<div className="user-vocab-word-form-grid">
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('kanjiPage.userDeckFieldChar')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.char}
									onChange={(e) => setWordForm((f) => ({ ...f, char: e.target.value }))}
									lang="ja"
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('kanjiPage.userDeckFieldOn')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.onYomi}
									onChange={(e) => setWordForm((f) => ({ ...f, onYomi: e.target.value }))}
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('kanjiPage.userDeckFieldKun')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.kunYomi}
									onChange={(e) => setWordForm((f) => ({ ...f, kunYomi: e.target.value }))}
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('kanjiPage.userDeckFieldHanViet')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.hanViet}
									onChange={(e) => setWordForm((f) => ({ ...f, hanViet: e.target.value }))}
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('kanjiPage.userDeckFieldMeaning')}</span>
								<input
									className="admin-grammar-input"
									value={wordForm.meaningVi}
									onChange={(e) => setWordForm((f) => ({ ...f, meaningVi: e.target.value }))}
									required
								/>
							</label>
						</div>
						<div className="user-vocab-mine-actions">
							{editingId ? (
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--ghost"
									onClick={resetForm}
								>
									{t('profile.cancel')}
								</button>
							) : null}
							<button
								type="submit"
								className="admin-grammar-btn admin-grammar-btn--primary"
								disabled={savingKanji || (!editingId && atLimit)}
							>
								{savingKanji ? t('profile.saving') : t('profile.save')}
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
								{t('kanjiPage.userDeckImportJson')}
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
							<p className="user-vocab-import-hint">{t('kanjiPage.userDeckImportHint')}</p>
							<textarea
								className="admin-grammar-textarea"
								rows={12}
								value={importText}
								onChange={(e) => setImportText(e.target.value)}
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
								{t('kanjiPage.userDeckImportRun')}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</Layout>
	);
}
