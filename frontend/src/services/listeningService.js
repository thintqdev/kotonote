import api from './api.js';
import { dedupePromise } from '../utils/dedupePromise.js';

const listeningService = {
  getAllPublished: async () => {
    return dedupePromise('listening:published', () => api.get('/listening'));
  },

  getById: async (id) => {
    return dedupePromise(`listening:${id}`, () => api.get(`/listening/${id}`));
  },
};

export default listeningService;
