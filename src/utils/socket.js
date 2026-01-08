import { io } from "socket.io-client";

// Senin IP adresin ve sunucunun çalıştığı port
const SOCKET_URL = "http://192.168.2.144:3000"; 

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});