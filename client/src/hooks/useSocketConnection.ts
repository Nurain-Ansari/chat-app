import { useEffect, useState } from "react";
import socket from "../socket";
import type { Message } from "../types/interface";

export function useSocketConnection(
  currUserId: string | null,
  selectedChatId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on("online", (userList: string[]) => {
      setOnlineUsers(userList);
    });

    socket.on("connect", () => {
      if (currUserId) socket.emit("online", currUserId);
    });

    if (selectedChatId) {
      socket.emit("join-chat", selectedChatId);
    }

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    socket.on("sent-message", (data: Message) => {
      if (data.chatId === selectedChatId) {
        setMessages((prev) => [...prev, data]);
        socket.emit("message-delivered", { messageId: data._id });
      }
    });

    socket.on("typing", ({ chatId }) => {
      if (chatId === selectedChatId) {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 1000);
        return () => clearTimeout(timer);
      }
    });

    socket.on("message-delivered", (messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg
        )
      );
    });

    return () => {
      socket.off("sent-message");
      socket.off("typing");
      socket.off("online");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("message-delivered");
      socket.off("message-read");
    };
  }, [currUserId, selectedChatId, setMessages]);

  return { onlineUsers, isTyping };
}
