import type { SetURLSearchParams } from "react-router-dom";
import type { Friend, Member } from "../../types/interface";
import Skeleton from "react-loading-skeleton";
import { format, parseISO } from "date-fns";

export default function FriendsList({
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
}) {
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
            // console.log(thisChat);
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
}
