import { useEffect, useState, useRef } from "react";
import { useSearchParams, type SetURLSearchParams } from "react-router-dom";
import socket from "../socket";
import { format, isToday, isYesterday, parseISO, isSameDay } from "date-fns";
import { FiSend, FiSearch } from "react-icons/fi";
import { IoPersonOutline, IoPeopleOutline } from "react-icons/io5";
import { BsCheck2All, BsCheck2 } from "react-icons/bs";
import { RiUserReceivedLine } from "react-icons/ri";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Types
export interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;
  __v?: number;
  status?: "sent" | "delivered" | "read";
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  __v: number;
}

interface Friend {
  user: User;
  _id: string;
  since: string;
}

// Sub-components
const FriendsList = ({
  friends,
  onlineUsers,
  searchTerm,
  loading,
  error,
  setSearchParams,
  senderId,
  setCurrUser,
}: {
  friends: Friend[];
  onlineUsers: string[];
  searchTerm: string;
  loading: boolean;
  error: string;
  setSearchParams: SetURLSearchParams;
  senderId: string | null;
  setCurrUser: React.Dispatch<React.SetStateAction<User | null>>;
}) => {
  const filteredFriends = friends.filter((friend) =>
    friend.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {loading ? (
        <div className="p-4 space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton circle width={40} height={40} />
                <div className="flex-1">
                  <Skeleton width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </div>
              </div>
            ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : filteredFriends.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {searchTerm ? "No matching friends found" : "No friends yet"}
        </div>
      ) : (
        <div>
          {filteredFriends.map((friend) => (
            <div
              key={friend._id}
              className={`p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer ${
                senderId === friend.user._id ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                setSearchParams({
                  senderId: senderId || "",
                  receiverId: friend.user._id,
                });
                setCurrUser(friend.user);
              }}
            >
              <div className="relative">
                <img
                  src={friend.user.profilePic || "/default-avatar.png"}
                  alt={friend.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {onlineUsers.includes(friend.user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{friend.user.name}</h3>
                <p className="text-xs text-gray-500 truncate">
                  {format(parseISO(friend.since), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const RequestsList = ({
  requests,
  loading,
  error,
}: {
  requests: Friend[];
  loading: boolean;
  error: string;
}) => {
  return (
    <>
      {loading ? (
        <div className="p-4 space-y-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton circle width={40} height={40} />
                <div className="flex-1">
                  <Skeleton width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </div>
              </div>
            ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : requests.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No friend requests</div>
      ) : (
        <div>
          {requests.map((request) => (
            <div
              key={request._id}
              className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer"
            >
              <img
                src={request.user.profilePic || "/default-avatar.png"}
                alt={request.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{request.user.name}</h3>
                <div className="flex gap-2 mt-1">
                  <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Accept
                  </button>
                  <button className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const ChatHeader = ({
  currUser,
  loading,
  isCurrUserOnline,
  isTyping,
}: {
  currUser: User | null;
  loading: boolean;
  isCurrUserOnline: boolean;
  isTyping: boolean;
}) => {
  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {loading ? (
            <Skeleton circle width={40} height={40} />
          ) : (
            <>
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
            </>
          )}
        </div>
        <div>
          {loading ? (
            <div className="space-y-1">
              <Skeleton width={120} height={18} />
              <Skeleton width={80} height={14} />
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-lg">{currUser?.name}</h2>
              <p className="text-xs text-gray-500">
                {isCurrUserOnline ? "Online" : "Offline"}
                {isTyping && isCurrUserOnline && " • typing..."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageList = ({
  messages,
  loading,
  error,
  senderId,
  messagesEndRef,
}: {
  messages: Message[];
  loading: boolean;
  error: string;
  senderId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
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
      ) < 600000
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

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const getMessageTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                <Skeleton
                  width={Math.floor(Math.random() * 200) + 100}
                  height={40}
                  className={`rounded-lg ${
                    i % 2 === 0 ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                />
              </div>
            ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : groupedMessages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          No messages yet. Start a conversation!
        </div>
      ) : (
        groupedMessages.map((group, groupIndex) => {
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
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span
                          className={`text-xs ${
                            isCurrentUser ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {getMessageTime(parseISO(message.createdAt || ""))}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs">
                            {message.status === "read" ? (
                              <BsCheck2All className="text-blue-100" />
                            ) : message.status === "delivered" ? (
                              <BsCheck2All className="text-gray-300" />
                            ) : (
                              <BsCheck2 className="text-gray-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

const MessageInput = ({
  text,
  setText,
  sendMessage,
  handleTyping,
  handleKeyDown,
}: {
  text: string;
  setText: (text: string) => void;
  sendMessage: () => void;
  handleTyping: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}) => {
  return (
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
          <FiSend className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

// Main Chat Component
export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const senderId =
    searchParams.get("senderId") || localStorage.getItem("userId");

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const id = localStorage.getItem("userId");
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
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/friend/friends`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${id}`,
            },
          }
        );
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
  }, [id]);

  // Fetch friend requests (empty for now)
  useEffect(() => {
    setLoading((prev) => ({ ...prev, requests: false }));
  }, []);

  // Fetch old messages
  useEffect(() => {
    if (!senderId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/messages/${senderId}/${receiverId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${id}`,
            },
          }
        );
        const data: Message[] = await res.json();
        setMessages(data);
        if (senderId) socket.emit("online", senderId);
      } catch {
        setError((prev) => ({
          ...prev,
          messages: "Failed to load messages",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    };

    setLoading((prev) => ({ ...prev, messages: true }));
    fetchMessages();
  }, [receiverId, senderId, id]);

  // Fetch user info
  useEffect(() => {
    // const fetchUser = async () => {
    //   try {
    //     if (!receiverId) return;

    //     const res = await fetch(
    //       `${import.meta.env.VITE_API_URL}/user/${receiverId}`,
    //       {
    //         method: "GET",
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${id}`,
    //         },
    //       }
    //     );
    //     const data = await res.json();
    //     setCurrUser(data);
    //   } catch {
    //     setError((prev) => ({
    //       ...prev,
    //       user: "Failed to load user info",
    //     }));
    //   } finally {
    //     setLoading((prev) => ({ ...prev, user: false }));
    //   }
    // };
    // setLoading((prev) => ({ ...prev, user: true }));

    const selectedFr = friends.find((ele) => ele.user._id === receiverId)?.user;

    setCurrUser(selectedFr || null);
    // fetchUser();
  }, [setCurrUser, friends, receiverId]);

  // Socket connection setup
  useEffect(() => {
    // console.log("Socket connection status:", socket.connected);

    socket.on("online", (userList: string[]) => {
      setOnlineUsers(userList);
    });

    socket.on("connect", () => {
      // console.log("Connected to socket server with ID:", socket.id);
      if (senderId) socket.emit("online", senderId);
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

        // Update message status to delivered
        if (data.sender === receiverId && data.receiver === senderId) {
          socket.emit("message-read", {
            messageId: data._id,
            receiverId: senderId,
          });
        }
      }
    });

    // Typing indicator handler
    socket.on("typing", (userId) => {
      if (userId === receiverId) {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 2000);
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

    socket.on("message-read", (messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "read" } : msg
        )
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("typing");
      socket.off("online");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("message-delivered");
      socket.off("message-read");
    };
  }, [receiverId, senderId]);

  const handleTyping = () => {
    if (senderId) socket.emit("typing", senderId);
  };

  const sendMessage = async () => {
    if (!text.trim() || !senderId || !receiverId) return;

    const msg: Message = {
      sender: senderId,
      receiver: receiverId,
      content: text,
      status: "sent",
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${id}`,
        },
        body: JSON.stringify(msg),
      });

      if (!res.ok) throw new Error("Message send failed");

      const savedMessage = await res.json();
      console.log("savedMessage: ", savedMessage);
      setMessages((prev) => [...prev, { ...savedMessage, status: "sent" }]);
      socket.emit("send-message", savedMessage);

      // Update status to delivered when received by server
      socket.emit("message-delivered", {
        messageId: savedMessage._id,
        senderId: savedMessage.sender,
      });

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

  const isCurrUserOnline = !!receiverId && onlineUsers.includes(receiverId);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left panel */}
      <div className="w-80 border-r bg-white flex flex-col">
        {/* Search bar */}
        <div className="p-3 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 flex items-center justify-center gap-2 ${
              activeTab === "friends"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("friends")}
          >
            <IoPeopleOutline className="text-lg" />
            <span>Friends</span>
          </button>
          <button
            className={`flex-1 py-3 flex items-center justify-center gap-2 ${
              activeTab === "requests"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            <RiUserReceivedLine className="text-lg" />
            <span>Requests</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "friends" ? (
            <FriendsList
              friends={friends}
              onlineUsers={onlineUsers}
              searchTerm={searchTerm}
              loading={loading.friends}
              error={error.friends}
              setSearchParams={setSearchParams}
              senderId={senderId}
              setCurrUser={setCurrUser}
            />
          ) : (
            <RequestsList
              requests={requests}
              loading={loading.requests}
              error={error.requests}
            />
          )}
        </div>
      </div>

      {/* Right panel - Chat area */}
      <div className="flex-1 flex flex-col">
        {receiverId ? (
          <>
            <ChatHeader
              currUser={currUser}
              loading={loading.user}
              isCurrUserOnline={isCurrUserOnline}
              isTyping={isTyping}
            />

            <MessageList
              messages={messages}
              loading={loading.messages}
              error={error.messages}
              senderId={senderId}
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
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <IoPersonOutline className="mx-auto text-5xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                Select a friend to chat
              </h3>
              <p className="text-gray-500 mt-1">
                Choose a friend from the list to start messaging or search for
                someone to connect with.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
