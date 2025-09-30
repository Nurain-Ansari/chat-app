import { useState, useEffect } from "react";
import type { Message } from "../types/interface";

export function useMessages(selectedChatId: string, currUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/message/${selectedChatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currUserId}`,
            },
          }
        );
        const data = await res.json();
        setMessages(data.data);
      } catch {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatId, currUserId]);

  return { messages, setMessages, loading, error };
}
