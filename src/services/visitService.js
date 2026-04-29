import api from './api';

const visitService = {
  create: async (visitData) => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },

  getPending: async () => {
    const response = await api.get('/visits/pending');
    return response.data;
  },

  getCompleted: async () => {
    const response = await api.get('/visits/completed');
    return response.data;
  },

  getByPatient: async (patientId) => {
    const response = await api.get(`/visits/patient/${patientId}`);
    return response.data;
  },

  uploadResults: async (visitId, resultData) => {
    const response = await api.put(`/visits/${visitId}/results`, resultData);
    return response.data;
  },
};

export default visitService;