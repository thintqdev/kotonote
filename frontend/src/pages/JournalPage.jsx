import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import StudyPageHeader from '../components/study/StudyPageHeader.jsx';
import { mockStreak } from '../data/dashboardHomeMock.js';
import {
	listJournalEntries,
	getJournalEntry,
	analyzeJournalEntry,
	deleteJournalEntry,
} from '../services/journalService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import './DashboardHome.css';
import './VocabularyPages.css';
import './JournalPages.css';

const JLPT_OPTIONS = ['N5', 'N4', 'N3', 'N2', 'N1'];

function formatEntryDate(iso, lang) {
	if (!iso) return '';
	try {
		return new Date(iso).toLocaleString(lang === 'ja' ? 'ja-JP' : 'vi-VN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return '';
	}
}

export default function JournalPage() {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const [entries, setEntries] = useState([]);
	const [quota, setQuota] = useState({ used: 0, limit: 3, remaining: 3 });
	const [listLoading, setListLoading] = useState(true);
	const [activeId, setActiveId] = useState(null);
	const [viewMode, setViewMode] = useState('compose');
	const [title, setTitle] = useState('');
	const [contentJa, setContentJa] = useState('');
	const [jlpt, setJlpt] = useState('N4');
	const [analysis, setAnalysis] = useState(null);
	const [analyzing, setAnalyzing] = useState(false);
	const [entryLoading, setEntryLoading] = useState(false);

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	const fetchList = useCallback(async () => {
		if (!user) return;
		setListLoading(true);
		try {
			const { entries: list, quota: q } = await listJournalEntries({ limit: 50 });
			setEntries(list);
			if (q) setQuota(q);
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setListLoading(false);
		}
	}, [user, t]);

	useEffect(() => {
		fetchList();
	}, [fetchList]);

	const resetCompose = () => {
		setActiveId(null);
		setViewMode('compose');
		setTitle('');
		setContentJa('');
		setJlpt('N4');
		setAnalysis(null);
	};

	const loadEntry = async (id) => {
		setEntryLoading(true);
		setActiveId(id);
		setViewMode('view');
		try {
			const entry = await getJournalEntry(id);
			if (!entry) return;
			setTitle(entry.title || '');
			setContentJa(entry.contentJa || '');
			setJlpt(entry.jlpt || 'N4');
			setAnalysis(entry.analysis || null);
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setEntryLoading(false);
		}
	};

	const handleAnalyze = async () => {
		const trimmed = contentJa.trim();
		if (!trimmed) {
			toast.error(t('journal.contentRequired'));
			return;
		}
		if (quota.remaining <= 0) {
			toast.error(t('journal.dailyLimit'));
			return;
		}
		setAnalyzing(true);
		try {
			const { entry, quota: q } = await analyzeJournalEntry({
				contentJa: trimmed,
				title: title.trim() || undefined,
				jlpt,
			});
			if (entry) {
				setActiveId(entry.id);
				setAnalysis(entry.analysis);
				setViewMode('view');
				if (q) setQuota(q);
				await fetchList();
				toast.success(t('journal.analyzedSuccess'));
			}
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		} finally {
			setAnalyzing(false);
		}
	};

	const handleDelete = async () => {
		if (!activeId) return;
		if (!window.confirm(t('journal.deleteConfirm'))) return;
		try {
			await deleteJournalEntry(activeId);
			toast.success(t('journal.deleted'));
			resetCompose();
			await fetchList();
		} catch (err) {
			toast.error(getApiErrorMessage(err, t));
		}
	};

	const quotaLabel =
		quota.remaining > 0
			? t('journal.quotaRemaining', {
					remaining: quota.remaining,
					limit: quota.limit,
				})
			: t('journal.quotaEmpty', { limit: quota.limit });

	return (
		<Layout
			userName={headerName}
			streakDays={mockStreak.currentStreak}
			pageClassName="journal-page vocab-scope"
		>
			<Breadcrumb
				items={[
					{ label: t('nav.home'), to: '/' },
					{ label: t('nav.journal') },
				]}
			/>
			<StudyPageHeader
				titleId="journal-page-title"
				title={t('journal.pageTitle')}
				subtitle={t('journal.pageSubtitle')}
			/>

			<div className="journal-layout">
				<aside className="journal-sidebar" aria-label={t('journal.historyTitle')}>
					<p
						className={`journal-quota ${quota.remaining <= 0 ? 'journal-quota--empty' : ''}`}
					>
						{quotaLabel}
					</p>
					<p className="journal-history-title">{t('journal.historyTitle')}</p>
					{listLoading ? (
						<p className="journal-empty-history">{t('common.loading')}</p>
					) : entries.length === 0 ? (
						<p className="journal-empty-history">{t('journal.historyEmpty')}</p>
					) : (
						<ul className="journal-history-list">
							{entries.map((e) => (
								<li key={e.id}>
									<button
										type="button"
										className={`journal-history-item ${activeId === e.id ? 'is-active' : ''}`}
										onClick={() => loadEntry(e.id)}
									>
										<span className="journal-history-item-title">
											{e.title || t('journal.untitled')}
										</span>
										<span className="journal-history-item-meta">
											{formatEntryDate(e.createdAt, i18n.language)}
											{e.analysis?.overallScore != null ? (
												<>
													{' · '}
													<span className="journal-history-score">
														{t('journal.scoreShort', {
															score: e.analysis.overallScore,
														})}
													</span>
												</>
											) : null}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</aside>

				<main className="journal-main">
					{viewMode === 'view' && activeId ? (
						<p className="journal-readonly-banner">{t('journal.viewingPast')}</p>
					) : null}

					<div className="journal-compose-toolbar">
						<label>
							{t('journal.jlptLabel')}
							<select
								value={jlpt}
								onChange={(ev) => setJlpt(ev.target.value)}
								disabled={viewMode === 'view' || analyzing || entryLoading}
							>
								{JLPT_OPTIONS.map((lv) => (
									<option key={lv} value={lv}>
										{lv}
									</option>
								))}
							</select>
						</label>
						<label style={{ flex: 1, minWidth: 160 }}>
							{t('journal.titleLabel')}
							<input
								type="text"
								value={title}
								onChange={(ev) => setTitle(ev.target.value)}
								placeholder={t('journal.titlePlaceholder')}
								maxLength={200}
								disabled={viewMode === 'view' || analyzing || entryLoading}
							/>
						</label>
					</div>

					<label className="sr-only" htmlFor="journal-content">
						{t('journal.contentLabel')}
					</label>
					<textarea
						id="journal-content"
						className="journal-textarea"
						value={contentJa}
						onChange={(ev) => setContentJa(ev.target.value)}
						placeholder={t('journal.contentPlaceholder')}
						maxLength={4000}
						disabled={viewMode === 'view' || analyzing || entryLoading}
						aria-busy={entryLoading}
					/>

					<div className="journal-actions">
						{viewMode === 'compose' ? (
							<button
								type="button"
								className="journal-btn-primary"
								onClick={handleAnalyze}
								disabled={analyzing || quota.remaining <= 0}
							>
								{analyzing ? t('journal.analyzing') : t('journal.analyze')}
							</button>
						) : (
							<>
								<button
									type="button"
									className="journal-btn-primary"
									onClick={resetCompose}
								>
									{t('journal.newEntry')}
								</button>
								{activeId ? (
									<button
										type="button"
										className="journal-btn-ghost"
										onClick={handleDelete}
									>
										{t('journal.delete')}
									</button>
								) : null}
							</>
						)}
					</div>

					{analysis ? (
						<section className="journal-result" aria-labelledby="journal-result-heading">
							<h2 id="journal-result-heading" className="sr-only">
								{t('journal.resultTitle')}
							</h2>
							<div className="journal-score-card">
								<div className="journal-score-badge" aria-label={t('journal.scoreLabel')}>
									{analysis.overallScore ?? '—'}
								</div>
								<div>
									{analysis.levelEstimate ? (
										<p>
											<strong>{t('journal.levelEstimate')}:</strong>{' '}
											{analysis.levelEstimate}
										</p>
									) : null}
									{analysis.summaryVi ? (
										<p className="journal-summary">{analysis.summaryVi}</p>
									) : null}
								</div>
							</div>

							{(analysis.strengthsVi?.length > 0 ||
								analysis.improvementsVi?.length > 0) && (
								<div className="journal-lists">
									{analysis.strengthsVi?.length > 0 ? (
										<div className="journal-list-block">
											<h3>{t('journal.strengths')}</h3>
											<ul>
												{analysis.strengthsVi.map((s) => (
													<li key={s}>{s}</li>
												))}
											</ul>
										</div>
									) : null}
									{analysis.improvementsVi?.length > 0 ? (
										<div className="journal-list-block">
											<h3>{t('journal.improvements')}</h3>
											<ul>
												{analysis.improvementsVi.map((s) => (
													<li key={s}>{s}</li>
												))}
											</ul>
										</div>
									) : null}
								</div>
							)}

							{analysis.sentences?.length > 0 ? (
								<div>
									<h3 className="journal-history-title">{t('journal.sentencesTitle')}</h3>
									{analysis.sentences.map((sent, idx) => (
										<article
											key={`${sent.index ?? idx}-${sent.textJa}`}
											className="journal-sentence-card"
										>
											<p className="journal-sentence-ja">{sent.textJa}</p>
											{sent.reading ? (
												<p className="journal-sentence-reading">{sent.reading}</p>
											) : null}
											{sent.translationVi ? (
												<p className="journal-sentence-vi">{sent.translationVi}</p>
											) : null}
											{sent.feedbackVi ? (
												<p className="journal-sentence-feedback">{sent.feedbackVi}</p>
											) : null}
											{sent.wordSuggestions?.length > 0 ? (
												<ul className="journal-suggestions">
													{sent.wordSuggestions.map((w) => (
														<li key={`${w.original}-${w.suggestedJa}`}>
															{w.original ? (
																<span className="journal-suggestion-original">
																	{w.original}
																</span>
															) : null}
															{w.original ? (
																<span className="journal-suggestion-arrow">→</span>
															) : null}
															<span className="journal-suggestion-new">
																{w.suggestedJa}
																{w.suggestedReading ? ` (${w.suggestedReading})` : ''}
															</span>
															{w.reasonVi ? (
																<div style={{ marginTop: '0.25rem', opacity: 0.85 }}>
																	{w.reasonVi}
																</div>
															) : null}
														</li>
													))}
												</ul>
											) : null}
										</article>
									))}
								</div>
							) : null}
						</section>
					) : null}
				</main>
			</div>
		</Layout>
	);
}
