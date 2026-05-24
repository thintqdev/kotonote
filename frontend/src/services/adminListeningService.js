import { ADMIN_LISTENING } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';
import { dedupePromise } from '../utils/dedupePromise.js';
import { multipartAxiosConfig } from '../utils/multipartAxiosConfig.js';

const adminListeningService = {
  getAll: async () => {
    return dedupePromise('admin:listening', () => adminApi.get(ADMIN_LISTENING.BASE));
  },

  getById: async (id) => {
    return dedupePromise(`admin:listening:${id}`, () =>
      adminApi.get(ADMIN_LISTENING.item(id)),
    );
  },

  create: async (data) => {
    return await adminApi.post(ADMIN_LISTENING.BASE, data);
  },

  update: async (id, data) => {
    return await adminApi.put(ADMIN_LISTENING.item(id), data);
  },

  delete: async (id) => {
    return await adminApi.delete(ADMIN_LISTENING.item(id));
  },

  /**
   * @param {File} file
   * @returns {Promise<string>} URL công khai (MinIO)
   */
  uploadAudio: async (file) => {
    const fd = new FormData();
    fd.append('audio', file);
    const body = await adminApi.post(ADMIN_LISTENING.UPLOAD_AUDIO, fd, multipartAxiosConfig);
    return getApiData(body).url ?? '';
  },

  /**
   * @param {File} file
   * @returns {Promise<string>} URL công khai (MinIO)
   */
  uploadImage: async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const body = await adminApi.post(ADMIN_LISTENING.UPLOAD_IMAGE, fd, multipartAxiosConfig);
    return getApiData(body).url ?? '';
  },
};

export default adminListeningService;
