import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lawshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Initialize Socket.io client singleton
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[LawShield Socket] Connected with ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[LawShield Socket] Connection warning:', err.message);
    });
  }
  return socket;
};

export { API_BASE_URL };
