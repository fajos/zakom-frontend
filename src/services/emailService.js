import api from './api';

const emailService = {
  sendResultEmail: async (patientEmail, patientName, visitId, results) => {
    const response = await api.post('/email/send-result', {
      to: patientEmail,
      patientName,
      visitId,
      results
    });
    return response.data;
  },

  sendInvoiceEmail: async (patientEmail, patientName, visitData) => {
    const response = await api.post('/email/send-invoice', {
      to: patientEmail,
      patientName,
      visitData
    });
    return response.data;
  }
};

export default emailService;