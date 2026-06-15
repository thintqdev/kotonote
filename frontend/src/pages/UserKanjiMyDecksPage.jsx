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
	createMyKanjiDeck,
	deleteMyKanjiDeck,
	listMyKanjiDecks,
} from '../services/userKanjiDeckService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { canCreateUserKanjiDecks } from '../utils/userDeckAccess.js';
import { JLPT_ORDER } from '../utils/deckStudy.js';
import './DashboardHome.css';
import './VocabularyPages.css';
import './GrammarPages.css';

const emptyForm = () => ({
	titleVi: '',
	titleJa: '',
	descriptionVi: '',
	jlpt: 'N5',
});

export default function UserKanjiMyDecksPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isLocked, membership } = useJlptAccess();
	const canCreate = canCreateUserKanjiDecks(membership);

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
			const data = await listMyKanjiDecks({ limit: 50 });
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
		if (isLocked(form.jlpt)) {
			toast.error(t('kanjiPage.userDeckJlptLocked', { level: form.jlpt }));
			return;
		}
		setSaving(true);
		try {
			const deck = await createMyKanjiDeck({
				titleVi: form.titleVi.trim(),
				titleJa: form.titleJa.trim(),
				descriptionVi: form.descriptionVi.trim(),
				jlpt: form.jlpt,
			});
			toast.success(t('kanjiPage.userDeckCreated'));
			setCreateOpen(false);
			setForm(emptyForm());
			navigate(`/kanji/mine/${deck._id}/edit`);
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (deck) => {
		if (
			!window.confirm(
				t('kanjiPage.userDeckDeleteConfirm', { title: deck.titleVi }),
			)
		) {
			return;
		}
		try {
			await deleteMyKanjiDeck(deck._id);
			toast.success(t('kanjiPage.userDeckDeleted'));
			void fetchList();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		}
	};

	const studyHref = (deck) =>
		`/kanji/lesson/1?deckId=${encodeURIComponent(deck._id)}&jlpt=${encodeURIComponent(deck.jlpt)}&userDeck=1`;

	return (
		<Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.kanji'), to: '/kanji/browse' },
					{ label: t('kanjiPage.userDeckTitle') },
				]}
			/>

			<article className="vocab-sheet vocab-scope vocab-notebook user-vocab-mine">
				<header className="user-vocab-mine-head">
					<div>
						<h1 className="vocab-lesson-title">{t('kanjiPage.userDeckTitle')}</h1>
						<p className="vocab-lesson-sub">{t('kanjiPage.userDeckSubtitle')}</p>
						{quota ? (
							<p className="user-vocab-quota">
								{t('kanjiPage.userDeckQuota', {
									used: quota.used ?? decks.length,
									max: quota.maxDecks ?? 0,
								})}
							</p>
						) : null}
					</div>
					<div className="user-vocab-mine-actions">
						<Link to="/kanji/browse" className="admin-grammar-btn admin-grammar-btn--ghost">
							{t('kanjiPage.userDeckBackOfficial')}
						</Link>
						{canCreate ? (
							<button
								type="button"
								className="admin-grammar-btn admin-grammar-btn--primary"
								onClick={() => setCreateOpen(true)}
							>
								+ {t('kanjiPage.userDeckCreate')}
							</button>
						) : (
							<Link to="/membership" className="admin-grammar-btn admin-grammar-btn--primary">
								{t('kanjiPage.userDeckUpgrade')}
							</Link>
						)}
					</div>
				</header>

				{loading ? (
					<p className="vocab-empty">{t('common.loading')}</p>
				) : decks.length === 0 ? (
					<p className="vocab-empty">{t('kanjiPage.userDeckEmpty')}</p>
				) : (
					<ul className="user-vocab-deck-grid">
						{decks.map((deck) => (
							<li key={deck._id} className="user-vocab-deck-card">
								<span className="grammar-jlpt-pill">{deck.jlpt}</span>
								<h2>{deck.titleVi}</h2>
								{deck.titleJa ? (
									<p className="user-vocab-deck-ja">{deck.titleJa}</p>
								) : null}
								<p className="user-vocab-deck-meta">
									{t('kanjiPage.userDeckKanjiCount', {
										count: deck.kanjiCount ?? 0,
									})}
								</p>
								<div className="user-vocab-deck-card-actions">
									<Link
										to={studyHref(deck)}
										className="admin-grammar-btn admin-grammar-btn--primary"
									>
										{t('kanjiPage.userDeckStudy')}
									</Link>
									<Link
										to={`/kanji/mine/${deck._id}/edit`}
										className="admin-grammar-btn admin-grammar-btn--ghost"
									>
										{t('kanjiPage.userDeckEdit')}
									</Link>
									<button
										type="button"
										className="admin-grammar-btn admin-grammar-btn--ghost"
										onClick={() => void handleDelete(deck)}
									>
										{t('kanjiPage.userDeckDelete')}
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
								{t('kanjiPage.userDeckCreate')}
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
								<span className="admin-grammar-label">
									{t('kanjiPage.userDeckFormTitleVi')}
								</span>
								<input
									className="admin-grammar-input"
									value={form.titleVi}
									onChange={(e) => setForm((f) => ({ ...f, titleVi: e.target.value }))}
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">
									{t('kanjiPage.userDeckFormTitleJa')}
								</span>
								<input
									className="admin-grammar-input"
									value={form.titleJa}
									onChange={(e) => setForm((f) => ({ ...f, titleJa: e.target.value }))}
									lang="ja"
									required
								/>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">JLPT</span>
								<select
									className="admin-grammar-select"
									value={form.jlpt}
									onChange={(e) => setForm((f) => ({ ...f, jlpt: e.target.value }))}
								>
									{JLPT_ORDER.map((lv) => (
										<option key={lv} value={lv} disabled={isLocked(lv)}>
											{lv}
											{isLocked(lv)
												? ` (${t('kanjiPage.badgeJlptLocked', { level: lv })})`
												: ''}
										</option>
									))}
								</select>
							</label>
							<label className="admin-grammar-field">
								<span className="admin-grammar-label">
									{t('kanjiPage.userDeckFormDesc')}
								</span>
								<textarea
									className="admin-grammar-textarea"
									rows={3}
									value={form.descriptionVi}
									onChange={(e) =>
										setForm((f) => ({ ...f, descriptionVi: e.target.value }))
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
									{saving ? t('profile.saving') : t('kanjiPage.userDeckCreate')}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</Layout>
	);
}
