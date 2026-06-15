import api from './api.js';
import { dedupePromise } from '../utils/dedupePromise.js';

const listeningService = {
  /**
   * @param {{ jlpt?: string }} [params]
   */
  getAllPublished: async (params = {}) => {
    const body = await api.get('/listening', { params });
    return {
      items: body.data?.items ?? [],
      jlptLevels: body.data?.jlptLevels ?? [],
      requestedJlptLocked: body.data?.requestedJlptLocked ?? false,
      pagination: body.pagination ?? body.data?.pagination ?? null,
    };
  },

  getById: async (id) => {
    const body = await api.get(`/listening/${id}`);
    return body.data?.item ?? body.data ?? null;
  },

  /**
   * @param {string} id
   * @param {{ status?: string, recordAnswer?: { questionIndex: number, choiceIndex: number } }} payload
   */
  saveProgress: async (id, payload) => {
    const body = await api.put(`/listening/${encodeURIComponent(id)}/progress`, payload);
    return body.data?.progress ?? null;
  },
};

export default listeningService;
