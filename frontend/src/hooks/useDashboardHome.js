import { useEffect, useState } from 'react';
import { getMyDashboardHome } from '../services/dashboardHomeService.js';
import {
	mockSubjectDefs,
	mockTodayTaskDefs,
	mockTodayProgress,
	mockStreak,
} from '../data/dashboardHomeMock.js';
import { SUBJECT_ROUTE_BY_ID } from '../constants/dashboardNav.js';
import { DEFAULT_DAILY_SUBJECT_GOALS } from '../constants/dailySubjectGoals.js';

/**
 * @param {boolean} enabled — gọi API khi user đã đăng nhập
 */
export function useDashboardHome(enabled = true) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(Boolean(enabled));
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!enabled) {
			setLoading(false);
			setData(null);
			setError(null);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);

		getMyDashboardHome()
			.then((home) => {
				if (!cancelled) setData(home);
			})
			.catch((err) => {
				if (!cancelled) {
					setError(err);
					setData(null);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [enabled]);

	return { data, loading, error };
}

/** Fallback mock khi API lỗi hoặc chưa có dữ liệu */
export function buildMockDashboardHomePayload() {
	return {
		streak: { days: mockStreak.days },
		subjects: mockSubjectDefs.map((s) => ({
			id: s.id,
			route: SUBJECT_ROUTE_BY_ID[s.id] || '/',
			progress: s.progress,
			totalCount: s.totalCount ?? 0,
			tint: s.tint,
			variant: s.variant,
		})),
		today: {
			percent: mockTodayProgress.percent,
			tasks: mockTodayTaskDefs.map((row) => {
				const targets = {
					g: DEFAULT_DAILY_SUBJECT_GOALS.grammar,
					v: DEFAULT_DAILY_SUBJECT_GOALS.vocab,
					k: DEFAULT_DAILY_SUBJECT_GOALS.kanji,
				};
				const key = row.detailKey;
				const target = targets[key] ?? 1;
				const completed =
					key === 'g' ? 0 : key === 'v' ? 9 : key === 'k' ? 5 : 0;
				return {
					subjectId: row.subjectId,
					detailKey: row.detailKey,
					target,
					completed,
				};
			}),
		},
	};
}
