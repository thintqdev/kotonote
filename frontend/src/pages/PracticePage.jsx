import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb } from '../components/common';
import StudyPageHeader from '../components/study/StudyPageHeader.jsx';
import { mockStreak } from '../data/dashboardHomeMock.js';
import './DashboardHome.css';
import './VocabularyPages.css';

export default function PracticePage() {
	const { t } = useTranslation();
	const { user } = useAuth();

	const headerName =
		(user?.name && String(user.name).trim().split(/\s+/)[0]) ||
		user?.email?.split('@')[0] ||
		t('demoProfile.firstName');

	return (
		<Layout
			userName={headerName}
			streakDays={mockStreak.days}
			pageClassName="vocab-dash"
		>
			<Breadcrumb
				items={[
					{ label: t('breadcrumb.home'), to: '/', end: true },
					{ label: t('breadcrumb.practice') },
				]}
			/>

			<article className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope">
				<StudyPageHeader
					titleId="practice-page-title"
					title={t('practicePage.title')}
					subtitle={t('practicePage.subtitle')}
				/>
				<p className="vocab-empty" role="status">
					{t('practicePage.comingSoon')}
				</p>
			</article>
		</Layout>
	);
}
