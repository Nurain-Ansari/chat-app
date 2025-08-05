import http from 'http';
import fs from 'fs';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import SwaggerUi from 'swagger-ui-express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRouter from './routes/auth.route';
import messageRoutes from './routes/message.route';
import userRoutes from './routes/user.routes';
import friendRoutes from './routes/friend.route';
import { requestLogger } from './middlewares/request-logger.middleware';
import { setupSocket } from './socket';
import chatRouter from './routes/chat.route';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
const server = http.createServer(app);

setupSocket(server);

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// Routes
app.use('/api/message', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api', authRouter);
app.use('/api/chat', chatRouter);

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
