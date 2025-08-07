import http from 'http';
import { Server } from 'socket.io';
import { MessageModel } from '../models/Message.model';

export function setupSocket(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Your frontend URL
      methods: ['GET', 'POST'],
    },
    path: '/api/socket.io',
  });

  const onlineUsers = new Set();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('online', (userId) => {
      onlineUsers.add(userId);
      io.emit('online', Array.from(onlineUsers));
    });

    socket.on('sent-message', (messageData) => {
      console.log('messageData: ', messageData);
      socket.broadcast.emit('sent-message', messageData);
    });

    socket.on('message-delivered', async ({ messageId }) => {
      await MessageModel.findByIdAndUpdate(messageId, {
        status: 'delivered',
      });

      io.emit('message-delivered', messageId);
    });

    // messageId: savedMessage._id,
    // receiverId: savedMessage.receiver,

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}
