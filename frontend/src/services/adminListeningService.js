import { adminApi } from './api.js';
import { dedupePromise } from '../utils/dedupePromise.js';

const adminListeningService = {
  getAll: async () => {
    return dedupePromise('admin:listening', () => adminApi.get('/admin/listening'));
  },

  getById: async (id) => {
    return dedupePromise(`admin:listening:${id}`, () =>
      adminApi.get(`/admin/listening/${id}`),
    );
  },

  create: async (data) => {
    return await adminApi.post('/admin/listening', data);
  },

  update: async (id, data) => {
    return await adminApi.put(`/admin/listening/${id}`, data);
  },

  delete: async (id) => {
    return await adminApi.delete(`/admin/listening/${id}`);
  },
};

export default adminListeningService;
