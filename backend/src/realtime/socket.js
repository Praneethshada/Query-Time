import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Not authorized"));
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
