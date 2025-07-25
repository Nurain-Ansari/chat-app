import http from 'http';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import express, { Request, Response, NextFunction } from 'express';
import SwaggerUi from 'swagger-ui-express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRouter from './routes/auth.route';
import messageRoutes from './routes/message.route';
import userRoutes from './routes/user.routes';
import friendRoutes from './routes/friend.route';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST'],
  },
  path: '/api/socket.io',
});

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

const onlineUsers = new Set();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('online', (userId) => {
    onlineUsers.add(userId);
    io.emit('online', Array.from(onlineUsers));
  });

  socket.on('send-message', (messageData) => {
    socket.broadcast.emit('receive-message', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api', authRouter);

const swaggerPath = path.resolve(__dirname, 'swagger', 'swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

// Serve it
app.use('/docs', SwaggerUi.serve, SwaggerUi.setup(swaggerDocument));

// Error handler (must be last)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Internal server error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

export { app, server };
