import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

let io;

export const initSocket = (httpServer) => {
  const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (clientOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Not authorized"));
      }
      if (!process.env.JWT_SECRET) {
        return next(new Error("JWT secret missing"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("Not authorized"));
      }
      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Not authorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("classroom:join", ({ classId }) => {
      if (!classId) return;
      const teacherRoom = `${classId}:teacher`;
      const studentRoom = `${classId}:student`;

      if (socket.user?.role === "teacher") {
        socket.join(teacherRoom);
      } else {
        socket.join(studentRoom);
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
