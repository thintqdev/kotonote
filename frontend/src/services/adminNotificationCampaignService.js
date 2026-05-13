import { ADMIN_NOTIFICATIONS } from "../constants/apiEndpoints.js";
import { getApiData } from "../utils/apiEnvelope.js";
import { adminApi } from "./api.js";

/**
 * @param {{ limit?: number, skip?: number }} [params]
 */
export async function listAdminNotificationCampaigns(params = {}) {
  const body = await adminApi.get(ADMIN_NOTIFICATIONS.campaigns, { params });
  return getApiData(body);
}

/**
 * @param {object} payload — audience, userIds, scheduledAt, title, message, type, category, actionType, actionData
 */
export async function createAdminNotificationCampaign(payload) {
  const body = await adminApi.post(ADMIN_NOTIFICATIONS.campaigns, payload);
  return getApiData(body);
}

/**
 * @param {string} campaignId
 */
export async function cancelAdminNotificationCampaign(campaignId) {
  const body = await adminApi.patch(
    ADMIN_NOTIFICATIONS.campaignCancel(campaignId)
  );
  return getApiData(body);
}
