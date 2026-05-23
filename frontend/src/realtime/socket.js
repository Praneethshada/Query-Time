import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");

export const createSocket = (token) => {
  if (!SOCKET_URL) {
    throw new Error("REACT_APP_SOCKET_URL is required in production");
  }
  return io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });
};
