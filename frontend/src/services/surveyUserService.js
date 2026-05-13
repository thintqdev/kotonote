import { SURVEY_API } from "../constants/surveyApi.js";
import { getApiData } from "../utils/apiEnvelope.js";
import api from "./api.js";

export async function fetchSurveyCompletionStatus() {
  const body = await api.get(SURVEY_API.status);
  return getApiData(body);
}

/**
 * @param {object} payload — level, goal, dailyTime, weakAreas, discovery, …
 */
export async function submitUserSurvey(payload) {
  const body = await api.post(SURVEY_API.submit, payload);
  return getApiData(body);
}
