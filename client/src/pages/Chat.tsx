import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import socket from "../socket";
import "react-loading-skeleton/dist/skeleton.css";
import Sidebar from "../components/chat/Sidebar";
import type { Friend, Member, Message } from "../types/interface";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import EmptyChat from "../components/chat/EmptyChat";

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedChatId = searchParams.get("chatId") || "";
  const currUserId = localStorage.getItem("userId");

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState({
    friends: true,
    messages: true,
    user: false,
    requests: true,
  });
  const [error, setError] = useState({
    friends: "",
    messages: "",
    user: "",
    requests: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/mine`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currUserId}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setFriends(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch friends");
        }
      } catch (err) {
        setError((prev) => ({
          ...prev,
          friends:
            err instanceof Error ? err.message : "Failed to fetch friends",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, friends: false }));
      }
    };

    fetchFriends();
  }, [currUserId]);

  // Fetch friend requests (empty for now)
  useEffect(() => {
    setLoading((prev) => ({ ...prev, requests: false }));
  }, []);

  // Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
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
        // if (senderId) socket.emit("online", senderId);
      } catch {
        setError((prev) => ({
          ...prev,
          messages: "Failed to load messages",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    };
    if (selectedChatId) {
      setLoading((prev) => ({ ...prev, messages: true }));
      fetchMessages();
    }
  }, [selectedChatId, currUserId]);

  // Fetch user info
  useEffect(() => {
    const selectedFr = friends.find((ele) => ele._id === selectedChatId)
      ?.members[0];
    if (selectedFr) {
      setSelectedUser(selectedFr);
    }
  }, [setSelectedUser, friends, selectedChatId]);

  // Socket connection setup
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

        socket.emit("message-delivered", {
          messageId: data._id,
        });

        // when user will see in really avaible window when auto scroll is off
        // if () {
        // socket.emit("message-read", {
        //   messageId: data._id,
        //   chatId: selectedChatId,
        // });
        // }
      }
    });

    // Typing indicator handler
    socket.on("typing", ({ chatId }) => {
      if (chatId === selectedChatId) {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 1000);
        return () => clearTimeout(timer);
      }
    });

    // Message status updates
    socket.on("message-delivered", (messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg
        )
      );
    });

    // socket.on("message-read", (messageId) => {
    //   setMessages((prev) =>
    //     prev.map((msg) =>
    //       msg._id === messageId ? { ...msg, status: "read" } : msg
    //     )
    //   );
    // });

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
  }, [currUserId, selectedChatId]);

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

  const isselectedUserOnline =
    !!selectedUser && onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left panel */}
      <div className="w-80 border-r bg-white flex flex-col">
        <Sidebar
          error={error}
          friends={friends}
          loading={loading}
          onlineUsers={onlineUsers}
          selectedChatId={selectedChatId}
          setSearchParams={setSearchParams}
          setSelectedUser={setSelectedUser}
        />
      </div>

      {/* Right panel - Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            <ChatHeader
              selectedUser={selectedUser}
              loading={loading.user}
              isselectedUserOnline={isselectedUserOnline}
              isTyping={isTyping}
            />

            <MessageList
              messages={messages}
              loading={loading.messages}
              error={error.messages}
              currUserId={currUserId}
              messagesEndRef={messagesEndRef}
            />

            <MessageInput
              text={text}
              setText={setText}
              sendMessage={sendMessage}
              handleTyping={handleTyping}
              handleKeyDown={handleKeyDown}
            />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}
