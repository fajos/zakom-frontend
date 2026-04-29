import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('zakom_token', response.data.token);
      localStorage.setItem('zakom_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('zakom_token');
    localStorage.removeItem('zakom_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('zakom_user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('zakom_token'),

  isAuthenticated: () => !!localStorage.getItem('zakom_token'),
};

export default authService;