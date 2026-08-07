import { io } from 'socket.io-client';
import { getAuthToken } from '@/lib/axios';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Lazily creates (or returns) the single shared socket connection.
 * We don't auto-connect on import — real-time features (Step 9: Chat,
 * Step 10: Notifications, Step 8: live bidding) call connectSocket() once
 * AuthContext confirms the user is logged in, and disconnectSocket() on
 * logout. This avoids anonymous sockets sitting open on public pages.
 */
export function connectSocket() {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getAuthToken() },
    autoConnect: true,
    transports: ['websocket'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
