import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) {
    console.log('Socket ya conectado');
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    // ⚠️ CRÍTICO: Forzamos WebSockets desde el inicio para evitar 
    // el error "Session ID unknown" con el Load Balancer de AWS.
    transports: ['websocket'],
    upgrade: false,
    autoConnect: true,
  });
  socket.on('connect', () => {
    console.log('✅ Socket conectado correctamente');
  });
  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión socket:', error);
  });
  socket.on('disconnect', () => {
    console.log('🔌 Socket desconectado');
  });
  return socket;
};
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket desconectado manualmente');
  }
};

export const getSocket = () => socket;
export default socket;

// Eventos de Socket.IO
export const socketEvents = {
  connect: 'connect',
  disconnect: 'disconnect',
  newMessage: 'newMessage',
  userJoined: 'userJoined',
  userLeft: 'userLeft',
};