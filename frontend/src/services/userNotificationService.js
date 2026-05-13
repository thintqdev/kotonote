import { NOTIFICATIONS } from "../constants/apiEndpoints.js";
import { getApiData } from "../utils/apiEnvelope.js";
import api from "./api.js";

/**
 * @returns {Promise<{ count: number }>}
 */
export async function fetchUnreadCount() {
  const body = await api.get(NOTIFICATIONS.UNREAD_COUNT);
  return getApiData(body);
}

/**
 * @param {{ limit?: number, skip?: number, isRead?: boolean }} [params]
 * @returns {Promise<{ notifications: object[], total: number }>}
 */
export async function fetchNotifications(params = {}) {
  const body = await api.get(NOTIFICATIONS.LIST, { params });
  return getApiData(body);
}

/**
 * @param {string} id
 */
export async function markNotificationRead(id) {
  const body = await api.put(NOTIFICATIONS.markRead(id));
  return getApiData(body);
}
