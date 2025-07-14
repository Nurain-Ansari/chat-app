import http from 'http';
import { Server } from 'socket.io';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import registerRouter from './routes/register.route';
import authRouter from './routes/auth.route';
import messageRoutes from './routes/message.route';
import userRoutes from './routes/users.route';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

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

app.use('/api', registerRouter);
app.use('/api', authRouter);

// Error handler (must be last)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Internal server error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

export default app;
