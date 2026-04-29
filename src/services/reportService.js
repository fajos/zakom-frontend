import api from './api';

const reportService = {
  // Get daily sales
  getDailySales: async () => {
    const response = await api.get('/reports/sales/daily');
    return response.data;
  },

  // Get monthly sales (pass year and month)
  getMonthlySales: async (year, month) => {
    const response = await api.get('/reports/sales/monthly', { 
      params: { year, month } 
    });
    return response.data;
  },

  // Get doctor referral performance
  getDoctorPerformance: async () => {
    const response = await api.get('/reports/doctors/performance');
    return response.data;
  },

  // Get test volume analytics
  getTestVolume: async () => {
    const response = await api.get('/reports/tests/volume');
    return response.data;
  },

  // Get detailed visit reports with date range
  getVisitsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/reports/visits', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

export default reportService;