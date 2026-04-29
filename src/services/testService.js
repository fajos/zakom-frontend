import api from './api';

const testService = {
  getAll: async () => {
    try {
      const response = await api.get('/tests');
      console.log('Get all tests response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get all tests error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  create: async (testData) => {
    const response = await api.post('/tests', testData);
    return response.data;
  },

  update: async (id, testData) => {
    console.log('Updating test:', id, testData);
    try {
      const response = await api.put(`/tests/${id}`, testData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },
};

export default testService;