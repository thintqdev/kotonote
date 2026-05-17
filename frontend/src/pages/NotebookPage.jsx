import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import NotebookRichEditor from '../components/notebook/NotebookRichEditor.jsx';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { NOTEBOOK_COVER_COLORS } from '../constants/notebookTheme.js';
import {
	listNotebookNotes,
	getNotebookNote,
	createNotebookNote,
	updateNotebookNote,
	deleteNotebookNote,
	uploadNotebookImage,
} from '../services/notebookService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './DashboardHome.css';
import './VocabularyPages.css';
import './NotebookPage.css';

const AUTOSAVE_MS = 900;

function formatNoteDate(iso, lang) {
	if (!iso) return '';
	try {
		return new Date(iso).toLocaleString(lang === 'ja' ? 'ja-JP' : 'vi-VN', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return '';
	}
}

export default function NotebookPage() {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const [notes, setNotes] = useState([]);
	const [listLoading, setListLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [searchDebounced, setSearchDebounced] = useState('');
	const [activeId, setActiveId] = useState(null);
	const [title, setTitle] = useState('');
	const [contentHtml, setContentHtml] = useState('');
	const [coverColor, setCoverColor] = useState('cream');
	const [isPinned, setIsPinned] = useState(false);
	const [noteLoading, setNoteLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveState, setSaveState] = useState('idle');
	const dirtyRef = useRef(false);
	const saveTimerRef = useRef(null);
	const skipLoadRef = useRef(false);

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(search), 350);
		return () => clearTimeout(timer);
	}, [search]);

	const fetchList = useCallback(async () => {
		if (!user) return;
		setListLoading(true);
		try {
			const { notes: list } = await listNotebookNotes({
				limit: 80,
				q: searchDebounced.trim() || undefined,
			});
			setNotes(list);
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setListLoading(false);
		}
	}, [user, searchDebounced, t]);

	useEffect(() => {
		void fetchList();
	}, [fetchList]);

	const loadNote = useCallback(
		async (id) => {
			if (!id) return;
			setNoteLoading(true);
			try {
				const note = await getNotebookNote(id);
				if (!note) return;
				skipLoadRef.current = true;
				setActiveId(note._id);
				setTitle(note.title || '');
				setContentHtml(note.contentHtml || '');
				setCoverColor(note.coverColor || 'cream');
				setIsPinned(Boolean(note.isPinned));
				dirtyRef.current = false;
				setSaveState('idle');
			} catch (err) {
				toast.error(getApiErrorMessage(err, t));
			} finally {
				setNoteLoading(false);
				setTimeout(() => {
					skipLoadRef.current = false;
				}, 50);
			}
		},
		[t],
	);

	const persistNote = useCallback(async () => {
		if (!user || !dirtyRef.current) return;
		setSaving(true);
		setSaveState('saving');
		const payload = {
			title: title.trim() || t('notebook.untitled'),
			contentHtml,
			coverColor,
			isPinned,
		};
		try {
			let saved;
			if (activeId) {
				saved = await updateNotebookNote(activeId, payload);
			} else {
				saved = await createNotebookNote(payload);
				if (saved?._id) {
					skipLoadRef.current = true;
					setActiveId(saved._id);
				}
			}
			dirtyRef.current = false;
			setSaveState('saved');
			if (saved) {
				setNotes((prev) => {
					const rest = prev.filter((n) => n._id !== saved._id);
					return [saved, ...rest].sort(
						(a, b) =>
							Number(b.isPinned) - Number(a.isPinned) ||
							new Date(b.updatedAt) - new Date(a.updatedAt),
					);
				});
			} else {
				void fetchList();
			}
		} catch (err) {
			setSaveState('error');
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setSaving(false);
		}
	}, [user, activeId, title, contentHtml, coverColor, isPinned, t, fetchList]);

	const markDirty = useCallback(() => {
		if (skipLoadRef.current) return;
		dirtyRef.current = true;
		setSaveState('dirty');
		if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		saveTimerRef.current = setTimeout(() => {
			void persistNote();
		}, AUTOSAVE_MS);
	}, [persistNote]);

	useEffect(
		() => () => {
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		},
		[],
	);

	const handleNewNote = async () => {
		if (dirtyRef.current && activeId) {
			await persistNote();
		}
		skipLoadRef.current = true;
		setActiveId(null);
		setTitle('');
		setContentHtml('');
		setCoverColor('cream');
		setIsPinned(false);
		dirtyRef.current = true;
		setSaveState('dirty');
		setTimeout(() => {
			skipLoadRef.current = false;
		}, 50);
	};

	const handleDelete = async () => {
		if (!activeId) return;
		if (!window.confirm(t('notebook.deleteConfirm'))) return;
		try {
			await deleteNotebookNote(activeId);
			toast.success(t('notebook.deleted'));
			setActiveId(null);
			setTitle('');
			setContentHtml('');
			dirtyRef.current = false;
			void fetchList();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		}
	};

	const handleUploadImage = useCallback(
		(file) => uploadNotebookImage(file),
		[],
	);

	const activeNoteMeta = useMemo(
		() => notes.find((n) => n._id === activeId),
		[notes, activeId],
	);

	const saveLabel =
		saveState === 'saving'
			? t('notebook.saving')
			: saveState === 'saved'
				? t('notebook.saved')
				: saveState === 'dirty'
					? t('notebook.unsaved')
					: saveState === 'error'
						? t('notebook.saveError')
						: '';

	return (
		<Layout userName={headerName} streakDays={mockStreak.days} pageClassName="nb-dash">
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.notebook') },
				]}
			/>

			<div className="nb-page vocab-scope">
				<header className="nb-page-head">
					<img
						className="nb-page-deco"
						src="/assets/decorates/pin2.png"
						alt=""
						width={64}
						height={64}
						decoding="async"
					/>
					<div>
						<h1 className="nb-page-title">{t('notebook.pageTitle')}</h1>
						<p className="nb-page-sub">{t('notebook.pageSubtitle')}</p>
					</div>
				</header>

				<div className="nb-layout">
					<aside className="nb-sidebar vocab-sheet vocab-notebook">
						<div className="nb-sidebar-top">
							<button type="button" className="nb-btn nb-btn--primary" onClick={handleNewNote}>
								+ {t('notebook.newNote')}
							</button>
							<label className="nb-search-wrap">
								<span className="nb-sr-only">{t('notebook.search')}</span>
								<input
									type="search"
									className="nb-search"
									placeholder={t('notebook.searchPlaceholder')}
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</label>
						</div>

						{listLoading ? (
							<p className="nb-list-empty">{t('common.loading')}</p>
						) : notes.length === 0 ? (
							<p className="nb-list-empty">{t('notebook.listEmpty')}</p>
						) : (
							<ul className="nb-note-list">
								{notes.map((note) => {
									const isActive = note._id === activeId;
									return (
										<li key={note._id}>
											<button
												type="button"
												className={`nb-note-card nb-note-card--${note.coverColor || 'cream'}${isActive ? ' is-active' : ''}`}
												onClick={() => void loadNote(note._id)}
											>
												{note.isPinned ? (
													<span className="nb-note-pin" aria-hidden>
														📌
													</span>
												) : null}
												<span className="nb-note-card-title">
													{note.title || t('notebook.untitled')}
												</span>
												<span className="nb-note-card-excerpt">
													{note.excerpt || t('notebook.noExcerpt')}
												</span>
												<span className="nb-note-card-date">
													{formatNoteDate(note.updatedAt, i18n.language)}
												</span>
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</aside>

					<main
						className={`nb-editor-panel vocab-sheet vocab-notebook nb-panel--${coverColor}`}
					>
						<span className="nb-panel-tape" aria-hidden />
						{noteLoading ? (
							<p className="nb-list-empty">{t('common.loading')}</p>
						) : (
							<>
								<div className="nb-panel-toolbar">
									<div className="nb-color-dots" role="group" aria-label={t('notebook.coverColor')}>
										{NOTEBOOK_COVER_COLORS.map((c) => (
											<button
												key={c}
												type="button"
												className={`nb-color-dot nb-color-dot--${c}${coverColor === c ? ' is-active' : ''}`}
												title={t(`notebook.colors.${c}`)}
												onClick={() => {
													setCoverColor(c);
													markDirty();
												}}
											/>
										))}
									</div>
									<div className="nb-panel-actions">
										<button
											type="button"
											className={`nb-btn nb-btn--ghost${isPinned ? ' is-on' : ''}`}
											onClick={() => {
												setIsPinned((p) => !p);
												markDirty();
											}}
										>
											📌 {t('notebook.pin')}
										</button>
										<button
											type="button"
											className="nb-btn nb-btn--ghost"
											onClick={() => void persistNote()}
											disabled={saving}
										>
											{t('notebook.saveNow')}
										</button>
										{activeId ? (
											<button
												type="button"
												className="nb-btn nb-btn--danger"
												onClick={() => void handleDelete()}
											>
												{t('notebook.delete')}
											</button>
										) : null}
										{saveLabel ? (
											<span
												className={`nb-save-status nb-save-status--${saveState}`}
												aria-live="polite"
											>
												{saveLabel}
											</span>
										) : null}
									</div>
								</div>

								<input
									type="text"
									className="nb-title-input"
									value={title}
									placeholder={t('notebook.titlePlaceholder')}
									onChange={(e) => {
										setTitle(e.target.value);
										markDirty();
									}}
								/>

								<NotebookRichEditor
									value={contentHtml}
									onChange={(html) => {
										setContentHtml(html);
										markDirty();
									}}
									onUploadImage={handleUploadImage}
									disabled={saving}
								/>

								{activeNoteMeta?.updatedAt ? (
									<p className="nb-panel-meta">
										{t('notebook.lastEdited', {
											date: formatNoteDate(
												activeNoteMeta.updatedAt,
												i18n.language,
											),
										})}
									</p>
								) : null}
							</>
						)}
					</main>
				</div>
			</div>
		</Layout>
	);
}
