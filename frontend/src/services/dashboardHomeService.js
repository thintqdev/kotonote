import { PROFILE } from '../constants/apiEndpoints.js';
import api from './api.js';

/** @typedef {import('../types/dashboardHome.js').DashboardHomeData} DashboardHomeData */

/**
 * @returns {Promise<DashboardHomeData | null>}
 */
export async function getMyDashboardHome() {
	const body = await api.get(PROFILE.DASHBOARD_HOME);
	return body.data?.home ?? null;
}
