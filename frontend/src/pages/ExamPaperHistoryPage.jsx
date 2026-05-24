import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import { mockStreak } from '../data/dashboardHomeMock.js';
import { examSessionLabel } from '../constants/examPaperFieldMeta.js';
import { listExamPaperAttempts } from '../services/examPaperService.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import {
	EXAM_MAX_TOTAL_SCORE,
	computeExamScaledScore,
} from '../utils/examScoreHelpers.js';
import './DashboardHome.css';
import './GrammarPages.css';
import './VocabularyPages.css';
import './ReadingListPage.css';
import './ExamPaperPages.css';

function formatWhen(iso, lang) {
	if (!iso) return '—';
	try {
		return new Date(iso).toLocaleString(lang.startsWith('ja') ? 'ja-JP' : 'vi-VN', {
			dateStyle: 'medium',
			timeStyle: 'short',
		});
	} catch {
		return String(iso);
	}
}

export default function ExamPaperHistoryPage() {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const lang = i18n.language || 'vi';

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return undefined;
		}
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError('');
			try {
				const data = await listExamPaperAttempts({ limit: 50 });
				if (!cancelled) setItems(data.items ?? []);
			} catch (err) {
				if (!cancelled) setError(getApiErrorMessage(err, t));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user, t]);

	return (
		<Layout userName={headerName} streakDays={mockStreak.days}>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.practice'), to: '/practice' },
					{ label: t('examPage.historyTitle') },
				]}
			/>

			<article className="grammar-sheet grammar-scope">
				<Link className="grammar-back" to="/practice">
					{t('examPage.backToList')}
				</Link>

				<header className="grammar-detail-head">
					<p className="grammar-detail-kicker">{t('examPage.historyKicker')}</p>
					<h1 className="grammar-detail-title">{t('examPage.historyTitle')}</h1>
					<p className="grammar-vi-note">{t('examPage.historySubtitle')}</p>
				</header>

				{loading ? <p className="vocab-empty">{t('common.loading')}</p> : null}
				{error ? (
					<p className="vocab-empty" role="alert">
						{error}
					</p>
				) : null}

				{!loading && !error && items.length === 0 ? (
					<p className="vocab-empty">{t('examPage.historyEmpty')}</p>
				) : null}

				{!loading && !error && items.length > 0 ? (
					<ul className="exam-history-list">
						{items.map((row) => {
							const snap = row.paperSnapshot ?? {};
							const scaled = computeExamScaledScore(
								row.correct ?? 0,
								row.total ?? 0,
							);
							const attemptId = String(row._id);
							return (
								<li key={attemptId} className="exam-history-card">
									<div className="exam-history-card-main">
										<p className="exam-history-card-kicker">
											{t('grammarPage.jlptBadge', { level: snap.jlpt || '—' })}
											{snap.year
												? ` · ${snap.year} · ${examSessionLabel(snap.session)}`
												: ''}
										</p>
										<h2 className="exam-history-card-title">{snap.titleVi}</h2>
										{snap.titleJa ? (
											<p className="exam-history-card-ja" lang="ja">
												{snap.titleJa}
											</p>
										) : null}
										<p className="exam-history-card-meta">
											{t('examPage.historyMeta', {
												score: scaled,
												max: EXAM_MAX_TOTAL_SCORE,
												correct: row.correct ?? 0,
												total: row.total ?? 0,
												when: formatWhen(row.submittedAt, lang),
											})}
										</p>
									</div>
									<div className="exam-history-card-actions">
										<Link
											to={`/practice/history/${attemptId}/result`}
											className="vocab-cta-btn"
										>
											{t('examPage.historyViewResult')}
										</Link>
									</div>
								</li>
							);
						})}
					</ul>
				) : null}
			</article>
		</Layout>
	);
}
