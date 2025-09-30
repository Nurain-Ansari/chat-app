import { useSearchParams } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import Sidebar from "../components/chat/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import EmptyChat from "../components/chat/EmptyChat";
import { useFriends } from "../hooks/useFriends";
import { useMessages } from "../hooks/useMessages";
import { useSelectedUser } from "../hooks/useSelectedUser";
import { useSocketConnection } from "../hooks/useSocketConnection";
import { useMessageActions } from "../hooks/useMessageActions";
import { useAutoScroll } from "../hooks/useAutoScroll";

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedChatId = searchParams.get("chatId") || "";
  const currUserId = localStorage.getItem("userId");

  // Custom hooks
  const {
    friends,
    loading: friendsLoading,
    error: friendsError,
  } = useFriends(currUserId);

  const {
    messages,
    setMessages,
    loading: messagesLoading,
    error: messagesError,
  } = useMessages(selectedChatId, currUserId);

  const { selectedUser, setSelectedUser } = useSelectedUser(
    friends,
    selectedChatId
  );

  const { onlineUsers, isTyping } = useSocketConnection(
    currUserId,
    selectedChatId,
    setMessages
  );

  const { text, setText, sendMessage, handleTyping, handleKeyDown } =
    useMessageActions(selectedChatId, currUserId, setMessages);

  const messagesEndRef = useAutoScroll(messages);

  // Reconstruct loading and error objects for components that need them
  const loading = {
    friends: friendsLoading,
    messages: messagesLoading,
    user: false,
    requests: false,
  };

  const error = {
    friends: friendsError,
    messages: messagesError,
    user: "",
    requests: "",
  };

  const isselectedUserOnline =
    !!selectedUser && onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex h-screen bg-gray-100">
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
