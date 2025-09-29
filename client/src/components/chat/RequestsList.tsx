import type { Friend } from "../../types/interface";
import Skeleton from "react-loading-skeleton";

export default function RequestsList({
  requests,
  loading,
  error,
}: {
  requests: Friend[];
  loading: boolean;
  error: string;
}) {
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
}
