import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vacctrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401 responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vacctrack_token');
      localStorage.removeItem('vacctrack_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const registerApi = (userData) => api.post('/auth/register', userData);
export const getCurrentUserApi = () => api.get('/auth/me');

// Children endpoints
export const getChildrenApi = (search = '') => api.get(`/children?search=${encodeURIComponent(search)}`);
export const addChildApi = (childData) => api.post('/children', childData);
export const getChildDetailsApi = (id) => api.get(`/children/${id}`);
export const updateChildApi = (id, childData) => api.put(`/children/${id}`, childData);
export const deleteChildApi = (id) => api.delete(`/children/${id}`);

// Vaccines endpoints
export const getVaccinesApi = () => api.get('/vaccines');
export const addVaccineApi = (vaccineData) => api.post('/vaccines', vaccineData);
export const updateVaccineApi = (id, vaccineData) => api.put(`/vaccines/${id}`, vaccineData);

// Vaccination records endpoints
export const getVaccinationsApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/vaccinations?${query}`);
};
export const getChildScheduleApi = (childId) => api.get(`/vaccinations/child/${childId}`);
export const recordVaccinationApi = (recordData) => api.post('/vaccinations/record', recordData);
export const updateVaccinationRecordApi = (id, recordData) => api.put(`/vaccinations/${id}`, recordData);

// Reminders endpoints
export const getRemindersApi = () => api.get('/reminders');
export const markReminderReadApi = (id) => api.put(`/reminders/${id}/read`);

// Dashboard endpoints
export const getParentDashboardApi = () => api.get('/dashboard/parent');
export const getHealthcareDashboardApi = () => api.get('/dashboard/healthcare');
export const getAdminDashboardApi = () => api.get('/dashboard/admin');

// Admin users & reports endpoints
export const getUsersApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/users?${query}`);
};
export const createUserApi = (userData) => api.post('/users', userData);
export const updateUserApi = (id, userData) => api.put(`/users/${id}`, userData);
export const getAnalyticsReportApi = () => api.get('/reports/analytics');

export default api;
