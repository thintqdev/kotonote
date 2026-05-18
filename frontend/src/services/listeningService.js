import api from './api';

const listeningService = {
  getAllPublished: async () => {
    const response = await api.get('/listening');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/listening/${id}`);
    return response.data;
  }
};

export default listeningService;
