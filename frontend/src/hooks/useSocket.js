import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

let socket = null;

export const useSocket = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('join', userId);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    socketRef.current = socket;

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // Only disconnect when user logs out
    };
  }, [userId]);

  return socketRef.current;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default useSocket;
