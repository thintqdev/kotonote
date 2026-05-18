import api from './api';

const adminListeningService = {
  getAll: async () => {
    const response = await api.get('/admin/listening');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/listening/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/admin/listening', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/admin/listening/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/listening/${id}`);
    return response.data;
  }
};

export default adminListeningService;
