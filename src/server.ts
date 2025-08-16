import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";

// Routes
import authRoutes from "./routes/authRoute";
import userRoutes from "./routes/usersRoute";
import conversationRoutes from "./routes/conversationRoute";
import messageRoutes from "./routes/messageRoute";
import {authMiddleware} from "./middlewares/authMiddleware";
import { setupSocket } from "./sockets/chatSocket";
import ConnectToDB from "./config/database";
import { devNull } from "os";

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(","),
    credentials: true,
  })
);

// Health
app.get("/api/v1/health", (_req, res) => res.json({ ok: true }));

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/messages", messageRoutes);

// Protected ping used by frontend 
app.get("/api/v1/protected", authMiddleware, (_req, res) => res.json({ ok: true }));

// Server + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(","),
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

let connectionString:null|string =null

// Start
if( !process.env.PRO_MONGO_URI|| !process.env.DEV_MONGO_URI ){
  console.log('connection string not found');
  process.exit(1)
}

if ( process.env.NODE_ENV != 'production' ) connectionString = process.env.DEV_MONGO_URI;
else
  connectionString = process.env.PRO_MONGO_URI;

const PORT = Number(process.env.PORT || 4000);
( async ( uri: string ) =>
{
  await ConnectToDB( uri ); 
  
server.listen(PORT, () => {
      console.log(` API listening on http://localhost:${PORT}`);
    });})(connectionString)
