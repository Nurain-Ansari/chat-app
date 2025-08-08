import { useEffect, useState, useRef, useMemo } from "react";
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
// export interface Message {
//   _id?: string;
//   sender: string;
//   receiver: string;
//   content: string;
//   createdAt?: string;
//   updatedAt?: string;
//   timestamp?: string;
//   __v?: number;
//   status?: "sent" | "delivered" | "read";
// }

interface Message {
  chatId: string;
  senderId: {
    _id: string;
    name: string;
    profilePic: string;
  };
  content: string;
  messageType?: "text" | "image" | "video" | "file";
  status: "sent" | "delivered" | "read";
  reactions?: {
    user: string;
    emoji: string;
  }[];
  seenBy?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  __v: number;
}

// interface Friend {
//   user: User;
//   _id: string;
//   since: string;
// }

export interface Member {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
}

export interface Friend {
  _id: string;
  isGroup: boolean;
  members: Member[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// interface PendingResponse {
//   pending: {
//     _id: string;
//     // from: Member;
//     to: string;
//     status: "pending";
//     createdAt: string; // ISO date string
//     updatedAt: string; // ISO date string
//     __v: number;
//   }[];
// }

// Sub-components
const FriendsList = ({
  friends,
  onlineUsers,
  searchTerm,
  loading,
  error,
  setSearchParams,
  selectedChatId,
  setSelectedUser,
}: {
  friends: Friend[];
  onlineUsers: string[];
  searchTerm: string;
  loading: boolean;
  error: string;
  setSearchParams: SetURLSearchParams;
  selectedChatId: string | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<Member | null>>;
}) => {
  const filteredFriends = friends.filter((friend) =>
    friend.members.find((ele) =>
      ele.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
          {filteredFriends.map((friend) => {
            const thisChat = friend.members[0];
            return (
              <div
                key={friend._id}
                className={`p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer ${
                  selectedChatId === friend._id ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  setSearchParams({
                    chatId: friend._id || "",
                  });
                  setSelectedUser(thisChat);
                }}
              >
                <div className="relative">
                  <img
                    src={thisChat.profilePic || "/default-avatar.png"}
                    alt={thisChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {onlineUsers.includes(thisChat._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{thisChat.name}</h3>
                  <p className="text-xs text-gray-500 truncate">
                    {format(parseISO(friend.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// const RequestsList = ({
//   requests,
//   loading,
//   error,
// }: {
//   requests: Friend[];
//   loading: boolean;
//   error: string;
// }) => {
//   return (
//     <>
//       {loading ? (
//         <div className="p-4 space-y-3">
//           {Array(3)
//             .fill(0)
//             .map((_, i) => (
//               <div key={i} className="flex items-center gap-3">
//                 <Skeleton circle width={40} height={40} />
//                 <div className="flex-1">
//                   <Skeleton width={120} height={16} />
//                   <Skeleton width={80} height={12} />
//                 </div>
//               </div>
//             ))}
//         </div>
//       ) : error ? (
//         <div className="p-4 text-center text-red-500">{error}</div>
//       ) : requests.length === 0 ? (
//         <div className="p-4 text-center text-gray-500">No friend requests</div>
//       ) : (
//         <div>
//           {requests.map((request) => (
//             <div
//               key={request._id}
//               className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer"
//             >
//               <img
//                 src={request.user.profilePic || "/default-avatar.png"}
//                 alt={request.user.name}
//                 className="w-10 h-10 rounded-full object-cover"
//               />
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-medium truncate">{request.user.name}</h3>
//                 <div className="flex gap-2 mt-1">
//                   <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
//                     Accept
//                   </button>
//                   <button className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
//                     Decline
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

const ChatHeader = ({
  selectedUser,
  loading,
  isselectedUserOnline,
  isTyping,
}: {
  selectedUser: Member | null;
  loading: boolean;
  isselectedUserOnline: boolean;
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
                src={selectedUser?.profilePic || "/default-avatar.png"}
                alt={selectedUser?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isselectedUserOnline ? "bg-green-500" : "bg-gray-400"
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
              <h2 className="font-semibold text-lg">{selectedUser?.name}</h2>
              <p className="text-xs text-gray-500">
                {isselectedUserOnline ? "Online" : "Offline"}
                {isTyping && isselectedUserOnline && " • typing..."}
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
  currUserId,
  messagesEndRef,
}: {
  messages: Message[];
  loading: boolean;
  error: string;
  currUserId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
  const groupedMessages = useMemo(() => {
    if (!messages) return [];

    return messages.reduce((acc, message) => {
      if (!message.createdAt) return acc;

      let msgDate: Date;
      try {
        msgDate = parseISO(message.createdAt);
      } catch {
        return acc;
      }

      const lastGroup = acc[acc.length - 1];
      if (
        lastGroup &&
        lastGroup.senderId._id === message.senderId._id &&
        isSameDay(lastGroup.date, msgDate) &&
        Math.abs(
          msgDate.getTime() -
            parseISO(
              lastGroup.messages[lastGroup.messages.length - 1].createdAt!
            ).getTime()
        ) < 600000 // 10 mins
      ) {
        lastGroup.messages.push(message);
      } else {
        acc.push({
          senderId: message.senderId,
          date: msgDate,
          messages: [message],
        });
      }

      return acc;
    }, [] as { senderId: Message["senderId"]; date: Date; messages: Message[] }[]);
  }, [messages]);

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const getMessageTime = (date: Date) => format(date, "h:mm a");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
          const isCurrentUser = group.senderId._id === currUserId;
          const showDateHeader =
            groupIndex === 0 ||
            !isSameDay(
              parseISO(groupedMessages[groupIndex - 1].messages[0].createdAt!),
              group.date
            );

          return (
            <div key={groupIndex} className="space-y-1">
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDateHeader(group.date)}
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
                    <div key={msgIndex} className="space-y-1">
                      {/* Bubble */}
                      <div
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
                            {message.createdAt
                              ? getMessageTime(parseISO(message.createdAt))
                              : ""}
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

                      {/* Reactions */}
                      {message.reactions?.length ? (
                        <div
                          className={`flex gap-1 mt-1 text-sm ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.reactions.map((reaction, i) => (
                            <span
                              key={i}
                              className="bg-white shadow px-2 py-1 rounded-full flex items-center gap-1"
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-xs text-gray-500">
                                {reaction.user}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}
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
  const selectedChatId = searchParams.get("chatId") || "";
  const currUserId = localStorage.getItem("userId");

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    // console.log("Socket connection status:", socket.connected);

    socket.on("online", (userList: string[]) => {
      setOnlineUsers(userList);
    });

    socket.on("connect", () => {
      // console.log("Connected to socket server with ID:", socket.id);
      if (currUserId) socket.emit("online", currUserId);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    socket.on("sent-message", (data: Message) => {
      console.log("data: ", data);
      // if (
      //   (data.sender === receiverId && data.receiver === senderId) ||
      //   (data.sender === senderId && data.receiver === receiverId)
      // ) {
      //   setMessages((prev) => [...prev, data]);

      //   // Update message status to delivered
      //   if (data.sender === receiverId && data.receiver === senderId) {
      //     socket.emit("message-read", {
      //       messageId: data._id,
      //       receiverId: senderId,
      //     });
      //   }
      // }
    });

    // Typing indicator handler
    // socket.on("typing", (userId) => {
    //   if (userId === receiverId) {
    //     setIsTyping(true);
    //     const timer = setTimeout(() => setIsTyping(false), 2000);
    //     return () => clearTimeout(timer);
    //   }
    // });

    // Message status updates
    // socket.on("message-delivered", (messageId) => {
    //   setMessages((prev) =>
    //     prev.map((msg) =>
    //       msg._id === messageId ? { ...msg, status: "delivered" } : msg
    //     )
    //   );
    // });

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
  }, [currUserId]);

  const handleTyping = () => {
    // if (senderId) socket.emit("typing", senderId);
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
      setMessages((prev) => [...prev, { ...savedMessage, status: "sent" }]);
      socket.emit("sent-message", savedMessage.data);

      // Update status to delivered when received by server
      socket.emit("message-delivered", {
        messageId: savedMessage.data._id,
        senderId: savedMessage.data.senderId,
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

  const isselectedUserOnline =
    !!selectedUser && onlineUsers.includes(selectedUser._id);

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
              selectedChatId={selectedChatId}
              setSelectedUser={setSelectedUser}
            />
          ) : (
            <></>
            // <RequestsList
            //   requests={requests}
            //   loading={loading.requests}
            //   error={error.requests}
            // />
          )}
        </div>
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
