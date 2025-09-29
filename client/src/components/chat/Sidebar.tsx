import { useState } from "react";
import FriendsList from "./FriendsList";
import { FiSearch } from "react-icons/fi";
import { IoPeopleOutline } from "react-icons/io5";
import { RiUserReceivedLine } from "react-icons/ri";
import type { Friend, Member } from "../../types/interface";
import type { SetURLSearchParams } from "react-router-dom";

export default function Sidebar({
  error,
  friends,
  loading,
  onlineUsers,
  selectedChatId,
  setSearchParams,
  setSelectedUser,
}: {
  friends: Friend[];
  onlineUsers: string[];
  loading: {
    friends: boolean;
    messages: boolean;
    user: boolean;
    requests: boolean;
  };
  error: {
    friends: string;
    messages: string;
    user: string;
    requests: string;
  };
  setSearchParams: SetURLSearchParams;
  selectedChatId: string | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<Member | null>>;
}) {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");
  // const [requests] = useState<Friend[]>([]);
  return (
    <>
      {/* Search bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            autoFocus
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
    </>
  );
}
