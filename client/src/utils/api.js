import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// We can add interceptors here if needed.
// E.g., handling 401 Unauthorized globally to clear local storage and redirect to login

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle token expiration globally
      console.warn('Unauthorized access, maybe token expired');
    }
    return Promise.reject(error);
  }
);

export default api;
