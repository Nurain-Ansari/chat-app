import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import { format, isToday, isYesterday, parseISO, isSameDay } from "date-fns";

export interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;
  __v?: number;
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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/${receiverId}`
        );
        const data = await res.json();
        setCurrUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    if (receiverId) fetchUser();
  }, [receiverId]);

  // Socket connection setup
  useEffect(() => {
    console.log("Socket connection status:", socket.connected);

    socket.on("online", (userList: string[]) => {
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
      if (
        (data.sender === receiverId && data.receiver === senderId) ||
        (data.sender === senderId && data.receiver === receiverId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on("typing", (userId) => {
      if (userId === receiverId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("typing");
      socket.off("online");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [receiverId, senderId]);

  const handleTyping = () => {
    socket.emit("typing", senderId);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

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
      socket.emit("send-message", savedMessage);
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

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const getMessageTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const isCurrUserOnline = receiverId && onlineUsers.includes(receiverId);

  // Group messages by sender and time proximity
  const groupedMessages = messages.reduce((acc, message) => {
    if (!message.createdAt) return acc;

    const msgDate = parseISO(message.createdAt);
    const lastGroup = acc[acc.length - 1];

    if (
      lastGroup &&
      lastGroup.sender === message.sender &&
      isSameDay(parseISO(lastGroup.messages[0].createdAt || ""), msgDate) &&
      Math.abs(
        new Date(lastGroup.messages[0].createdAt || "").getTime() -
          msgDate.getTime()
      ) < 600000 // 10 minutes in milliseconds
    ) {
      lastGroup.messages.push(message);
    } else {
      acc.push({
        sender: message.sender,
        date: msgDate,
        messages: [message],
      });
    }

    return acc;
  }, [] as { sender: string; date: Date; messages: Message[] }[]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={currUser?.profilePic || "/default-avatar.png"}
              alt={currUser?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isCurrUserOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">{currUser?.name}</h2>
            <p className="text-xs text-gray-500">
              {isCurrUserOnline ? "Online" : "Offline"}
              {isTyping && isCurrUserOnline && " • typing..."}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group, groupIndex) => {
          const isCurrentUser = group.sender === senderId;
          const groupDate = group.date;
          const showDateHeader =
            groupIndex === 0 ||
            !isSameDay(
              parseISO(
                groupedMessages[groupIndex - 1].messages[0].createdAt || ""
              ),
              groupDate
            );

          return (
            <div key={groupIndex} className="space-y-1">
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDateHeader(groupDate)}
                  </span>
                </div>
              )}

              <div
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex flex-col space-y-1 max-w-xs lg:max-w-md ${
                    isCurrentUser ? "items-end" : "items-start"
                  }`}
                >
                  {group.messages.map((message, msgIndex) => (
                    <div
                      key={message._id || msgIndex}
                      className={`p-3 rounded-lg ${
                        isCurrentUser
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <div className="break-words">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isCurrentUser ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {getMessageTime(parseISO(message.createdAt || ""))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex space-x-2"
        >
          <input
            type="text"
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!text.trim()}
            title="Send message"
            type="submit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
