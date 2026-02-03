import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ["websocket"],
    });
  }
  return socket;
};
