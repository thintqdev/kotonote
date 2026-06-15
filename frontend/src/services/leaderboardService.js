import { LEADERBOARD } from '../constants/apiEndpoints.js';
import api from './api.js';

/**
 * @param {{ jlpt?: string, limit?: number }} [params]
 */
export async function getLeaderboards(params = {}) {
	const body = await api.get(LEADERBOARD.BASE, { params });
	return (
		body.data ?? {
			streak: [],
			lessons: { jlpt: 'N5', entries: [] },
			me: { streak: null, lessons: null },
			limit: 10,
		}
	);
}
