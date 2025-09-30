import { useState } from "react";
import socket from "../socket";
import type { Message } from "../types/interface";

export function useMessageActions(
  selectedChatId: string,
  currUserId: string | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [text, setText] = useState("");

  const handleTyping = () => {
    if (selectedChatId && currUserId) {
      socket.emit("typing", { chatId: selectedChatId, userId: currUserId });
    }
  };

  const sendMessage = async () => {
    if (!selectedChatId || !currUserId || !text) return;

    const msg = {
      chatId: selectedChatId,
      senderId: currUserId,
      content: text,
      status: "sent",
      messageType: "text",
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currUserId}`,
        },
        body: JSON.stringify(msg),
      });

      if (!res.ok) throw new Error("Message send failed");

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, { ...savedMessage.data }]);
      socket.emit("sent-message", savedMessage.data);

      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return { text, setText, sendMessage, handleTyping, handleKeyDown };
}
