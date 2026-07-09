import { io } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const socket = io(socketUrl, {
  autoConnect: false, // Connect manually where needed (e.g., after login or in specific components)
});

export default socket;
