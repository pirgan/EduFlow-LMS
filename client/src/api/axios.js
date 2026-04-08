import axios from 'axios';

// Axios instance pre-configured with the API base URL.
// Set VITE_API_URL in client/.env (e.g. http://localhost:5000/api).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT from localStorage to every outbound request.
// The server's protect middleware expects: Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
