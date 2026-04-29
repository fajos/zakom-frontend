import api from './api';

const doctorService = {
  getAll: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  create: async (doctorData) => {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  },

  update: async (id, doctorData) => {
    const response = await api.put(`/doctors/${id}`, doctorData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },
};

export default doctorService;