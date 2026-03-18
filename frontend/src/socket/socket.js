import { io } from 'socket.io-client';

let socketInstance;

export const connectSocket = (token) => {
  if (!token) return null;

  if (socketInstance) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800,
    auth: { token }
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
