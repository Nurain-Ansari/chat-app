import type { Member } from "../../types/interface";
import Skeleton from "react-loading-skeleton";

export default function ChatHeader({
  isTyping,
  isselectedUserOnline,
  loading,
  selectedUser,
}: {
  selectedUser: Member | null;
  loading: boolean;
  isselectedUserOnline: boolean;
  isTyping: boolean;
}) {
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
}
