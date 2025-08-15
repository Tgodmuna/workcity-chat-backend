import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import chatSocketHandler from './sockets/chatSocket';
import ConnectToDB from './config/database';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DEV_MONGO_URI || '';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: '*' },
});

io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);
  chatSocketHandler(socket, io);
});

// Connect to MongoDB & start server
(async (uri: string) => await ConnectToDB(uri))(MONGO_URI);

server.listen(PORT, () => console.log(`Server running on port ${PORT} `));
