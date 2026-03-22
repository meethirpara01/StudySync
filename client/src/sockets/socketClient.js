import { io } from 'socket.io-client';

// Use current origin for production, fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
