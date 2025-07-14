import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../socket"; // import socket

export interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp?: string;
}

export default function Chat() {
  const { receiverId, senderId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  // Fetch old messages
  useEffect(() => {
    if (!senderId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/messages/${senderId}/${receiverId}`
        );
        const data: Message[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [receiverId, senderId]);

  // Socket connection setup
  useEffect(() => {
    console.log("Socket connection status:", socket.connected);

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });
    socket.on("receive-message", (data: Message) => {
      // Only append message if it's for this chat
      if (
        (data.sender === receiverId && data.receiver === senderId) ||
        (data.sender === senderId && data.receiver === receiverId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [receiverId, senderId]);

  const sendMessage = async () => {
    const msg: Message = {
      sender: senderId as string,
      receiver: receiverId as string,
      content: text,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      if (!res.ok) throw new Error("Message send failed");

      const savedMessage = await res.json();

      setMessages((prev) => [...prev, savedMessage]);
      socket.emit("send-message", savedMessage); // emit through socket
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded shadow p-4 space-y-4">
        <h2 className="text-xl font-semibold">Chat with {receiverId}</h2>
        <div className="h-96 overflow-y-auto border p-2 rounded bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 my-1 rounded ${
                msg.sender === senderId
                  ? "bg-blue-100 text-right"
                  : "bg-gray-200"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={sendMessage}
            disabled={!text.trim()}
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
