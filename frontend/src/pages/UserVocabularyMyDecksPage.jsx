import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useJlptAccess } from '../hooks/useJlptAccess.js';
import {
	createMyVocabularyDeck,
	deleteMyVocabularyDeck,
	listMyVocabularyDecks,
} from '../services/userVocabularyDeckService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { canCreateUserVocabularyDecks } from '../utils/userDeckAccess.js';
import { JLPT_ORDER, jlptToApiLevel, levelToJlpt } from '../utils/deckStudy.js';
import './DashboardHome.css';
import './VocabularyPages.css';
import './GrammarPages.css';

const emptyForm = () => ({
	title: '',
	titleJa: '',
	description: '',
	level: 'n5',
});

export default function UserVocabularyMyDecksPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isLocked, membership } = useJlptAccess();
	const canCreate = canCreateUserVocabularyDecks(membership);

	const [decks, setDecks] = useState([]);
	const [quota, setQuota] = useState(null);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [saving, setSaving] = useState(false);

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	const fetchList = useCallback(async () => {
		setLoading(true);
		try {
			const data = await listMyVocabularyDecks({ limit: 50 });
			setDecks(data.decks ?? []);
			setQuota(data.quota);
		} catch (e) {
			toast.error(getApiErrorMessage(e, t));
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		void fetchList();
	}, [fetchList]);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!canCreate) {
			navigate('/membership');
			return;
		}
		const lv = levelToJlpt(form.level);
		if (isLocked(lv)) {
			toast.error(t('vocabPage.userDeckJlptLocked', { level: lv }));
			return;
		}
		setSaving(true);
		try {
			const deck = await createMyVocabularyDeck({
				title: form.title.trim(),
				titleJa: form.titleJa.trim(),
				description: form.description.trim(),
				level: form.level,
				category: 'other',
			});
			toast.success(t('vocabPage.userDeckCreated'));
			setCreateOpen(false);
			setForm(emptyForm());
			navigate(`/vocabulary/mine/${deck._id}/edit`);
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (deck) => {
		if (!window.confirm(t('vocabPage.userDeckDeleteConfirm', { title: deck.title }))) {
			return;
		}
		try {
			await deleteMyVocabularyDeck(deck._id);
			toast.success(t('vocabPage.userDeckDeleted'));
			void fetchList();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		}
	};

	const studyHref = (deck) => {
		const jlpt = levelToJlpt(deck.level);
		return `/vocabulary/lesson/1?deckId=${encodeURIComponent(deck._id)}&jlpt=${encodeURIComponent(jlpt)}&userDeck=1`;
	};

	return (
		<Layout
			userName={headerName}
			streakDays={mockStreak.days}
			pageClassName="vocab-dash"
		>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.vocabulary'), to: '/vocabulary/browse' },
					{ label: t('vocabPage.userDeckTitle') },
				]}
			/>

			<article className="vocab-sheet vocab-scope vocab-notebook user-vocab-mine">
				<header className="user-vocab-mine-head">
					<div>
						<h1 className="vocab-lesson-title">{t('vocabPage.userDeckTitle')}</h1>
						<p className="vocab-lesson-sub">{t('vocabPage.userDeckSubtitle')}</p>
						{quota ? (
							<p className="user-vocab-quota">
								{t('vocabPage.userDeckQuota', {
									used: quota.used ?? decks.length,
									max: quota.maxDecks ?? 0,
								})}
							</p>
						) : null}
					</div>
					<div className="user-vocab-mine-actions">
						<Link to="/vocabulary/browse" className="admin-grammar-btn admin-grammar-btn--ghost">
							{t('vocabPage.userDeckBackOfficial')}
						</Link>
						{canCreate ? (
							<button
								type="button"
								className="admin-grammar-btn admin-grammar-btn--primary"
								onClick={() => setCreateOpen(true)}
							>
								+ {t('vocabPage.userDeckCreate')}
							</button>
						) : (
							<Link to="/membership" className="admin-grammar-btn admin-grammar-btn--primary">
								{t('vocabPage.userDeckUpgrade')}
							</Link>
						)}
					</div>
				</header>

				{loading ? (
					<p className="vocab-empty">{t('common.loading')}</p>
				) : decks.length === 0 ? (
					<p className="vocab-empty">{t('vocabPage.userDeckEmpty')}</p>
				) : (
					<ul className="user-vocab-deck-grid">
						{decks.map((deck) => (
							<li key={deck._id} className="user-vocab-deck-card">
								<span className="grammar-jlpt-pill">{levelToJlpt(deck.level)}</span>
								<h2>{deck.title}</h2>
								{deck.titleJa ? <p className="user-vocab-deck-ja">{deck.titleJa}</p> : null}
								<p className="user-vocab-deck-meta">
									{t('vocabPage.userDeckWordCount', {
										count: deck.wordCount ?? deck.totalWords ?? 0,
									})}
								</p>
								<div className="user-vocab-deck-card-actions">
									<Link
										to={studyHref(deck)}
										className="admin-grammar-btn admin-grammar-btn--primary"
									>
										{t('vocabPage.userDeckStudy')}
									</Link>
									<Link
										to={`/vocabulary/mine/${deck._id}/edit`}
										className="admin-grammar-btn admin-grammar-btn--ghost"
									>
										{t('vocabPage.userDeckEdit')}
									</Link>
									<button
										type="button"
										className="admin-grammar-btn admin-grammar-btn--ghost"
										onClick={() => void handleDelete(deck)}
									>
										{t('vocabPage.userDeckDelete')}
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</article>

			{createOpen ? (
				<div
					className="admin-grammar-modal-backdrop"
					role="presentation"
					onClick={() => setCreateOpen(false)}
				>
					<div
						className="admin-grammar-modal"
						role="dialog"
						aria-modal="true"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="admin-grammar-modal-header">
							<h2 className="admin-grammar-modal-title">
								{t('vocabPage.userDeckCreate')}
							</h2>
							<button
								type="button"
								className="admin-grammar-modal-close"
								onClick={() => setCreateOpen(false)}
							>
								×
							</button>
						</div>
						<form className="admin-grammar-modal-body" onSubmit={(e) => void handleCreate(e)}>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('vocabPage.userDeckFormTitle')}</span>
								<input
									className="admin-grammar-input"
									value={form.title}
									onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('vocabPage.userDeckFormTitleJa')}</span>
								<input
									className="admin-grammar-input"
									value={form.titleJa}
									onChange={(e) => setForm((f) => ({ ...f, titleJa: e.target.value }))}
									lang="ja"
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">JLPT</span>
								<select
									className="admin-grammar-select"
									value={form.level}
									onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
								>
									{JLPT_ORDER.map((lv) => {
										const apiLv = jlptToApiLevel(lv);
										const locked = isLocked(lv);
										return (
											<option key={lv} value={apiLv} disabled={locked}>
												{lv}
												{locked
													? ` (${t('vocabPage.badgeJlptLocked', { level: lv })})`
													: ''}
											</option>
										);
									})}
								</select>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">{t('vocabPage.userDeckFormDesc')}</span>
								<textarea
									className="admin-grammar-textarea"
									rows={3}
									value={form.description}
									onChange={(e) =>
										setForm((f) => ({ ...f, description: e.target.value }))
									}
								/>
							</label>
							<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--ghost"
									onClick={() => setCreateOpen(false)}
								>
									{t('profile.cancel')}
								</button>
								<button
									type="submit"
									className="admin-grammar-btn admin-grammar-btn--primary"
									disabled={saving}
								>
									{saving ? t('profile.saving') : t('vocabPage.userDeckCreate')}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</Layout>
	);
}
