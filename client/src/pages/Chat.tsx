import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../socket"; // import socket
import { format, isToday, isYesterday, parseISO, isSameDay } from "date-fns";

export interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp?: string;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  __v: number;
}

export default function Chat() {
  const { receiverId, senderId } = useParams();
  const [onlineUsers, setOnlineUsers] = useState([""]);
  const [currUser, setCurrUser] = useState<User>();
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
        socket.emit("online", senderId);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [receiverId, senderId]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/${receiverId}`
      );
      const data = await res.json();
      setCurrUser(data);
    };

    fetchUser();
  }, [receiverId]);

  // Socket connection setup
  useEffect(() => {
    console.log("Socket connection status:", socket.connected);

    socket.on("receive-online", (userList) => {
      // console.log("data: ", userList);
      setOnlineUsers(userList);
    });

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
      console.log("k");
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
  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMMM yyyy"); // e.g., "23 July 2025"
  };
  let lastMessageDate: string | null = null;

  const isCurrUserOnline = receiverId && onlineUsers.includes(receiverId);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded shadow p-4 space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          Name: {currUser?.name}
          <span
            className={`relative ml-2 inline-block h-2 w-2 rounded-full ${
              isCurrUserOnline
                ? "bg-gradient-to-br from-green-400 to-green-600"
                : "bg-gradient-to-br from-gray-500 to-red-600"
            }`}
            style={{
              backgroundSize: "200% 200%",
              animation: isCurrUserOnline
                ? "pulse 2s ease-in-out infinite, scale 1.5s ease-in-out infinite"
                : "pulse 2s ease-in-out infinite",
            }}
          ></span>
        </h2>
        <div className="h-96 overflow-y-auto  border p-2 rounded bg-gray-50">
          {messages.map((msg) => {
            if (!msg.timestamp) return null; //  we don't have timestamp

            const msgDate = parseISO(msg.timestamp);
            const currentDateHeader = formatDateHeader(msgDate);

            const shouldShowDateHeader =
              !lastMessageDate ||
              !isSameDay(parseISO(lastMessageDate), msgDate);

            if (shouldShowDateHeader) {
              lastMessageDate = msg.timestamp;
            }

            return (
              <div key={msg._id} className="mb-2">
                {shouldShowDateHeader && (
                  <div className="sticky top-0 z-10 my-2 text-center text-sm font-medium text-gray-600 bg-gray-100 py-1">
                    {currentDateHeader}
                  </div>
                )}

                <div
                  key={msg._id}
                  className={`mb-2 flex ${
                    msg.sender === senderId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded w-fit max-w-[80%] ${
                      msg.sender === senderId
                        ? "bg-blue-100 text-right"
                        : "bg-gray-200 text-left"
                    }`}
                  >
                    <div className="inline-block break-words">
                      <div>{msg.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(msgDate, "hh:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
