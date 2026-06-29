import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export const csrf = () =>
  api.get(`${BACKEND_URL}/sanctum/csrf-cookie`);

export default api;
