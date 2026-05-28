import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = 'https://duo-deals.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling (401, 404, 500)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const errorMessage = data && typeof data === 'object' && data.message 
        ? data.message 
        : (data && typeof data === 'string' ? data : null);

      switch (status) {
        case 401:
          // Token expired or invalid -> clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user_profile');
          message.error('Session expired. Please log in again.');
          
          // Only redirect if we are not already on the login/register pages
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
          break;
          
        case 403:
          // Forbidden — could be expired token or insufficient permission
          // Only redirect to login if there's no token stored (truly unauthenticated)
          if (!localStorage.getItem('token')) {
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
              window.location.href = '/login';
            }
          }
          // Otherwise let the caller handle 403 silently (e.g. search endpoint)
          break;
          
        case 404:
          message.error(errorMessage || 'Requested resource not found.');
          break;
          
        case 500:
          message.error(errorMessage || 'Something went wrong on the server. Please try again.');
          break;
          
        case 400:
          // Validation or bad request -> let the component handle it natively, or show error message
          message.error(errorMessage || 'Invalid request. Please verify inputs.');
          break;
          
        default:
          message.error(errorMessage || 'An unexpected error occurred.');
          break;
      }
    } else if (error.request) {
      message.error('Unable to connect to the server. Please check if backend is running on port 8081.');
    } else {
      message.error('An error occurred during request processing.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
