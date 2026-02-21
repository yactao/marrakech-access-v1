import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // envoie les cookies httpOnly automatiquement
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur requête : ajoute le token JWT depuis localStorage (rétrocompat Bearer)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur réponse : refresh auto sur 401
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 sur une route autre que /refresh (évite la boucle infinie)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Le refresh_token httpOnly est envoyé automatiquement via withCredentials
          const res = await api.post('/auth/refresh');
          const newToken = res.data.token;

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', newToken);
          }

          // Relancer toutes les requêtes en attente avec le nouveau token
          pendingRequests.forEach((cb) => cb(newToken));
          pendingRequests = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          // Refresh échoué → déconnexion complète
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      // Déjà en train de refresh : mettre la requête en file d'attente
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);