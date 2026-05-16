import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import { initSocket } from "./src/realtime/socket.js";

import userRoutes from "./src/routes/userRoutes.js";
import classroomRoutes from "./src/routes/classroomRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";

dotenv.config();
connectDB();
const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/questions", questionRoutes);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
