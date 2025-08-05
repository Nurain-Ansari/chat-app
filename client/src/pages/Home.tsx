/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  profilePic?: string;
}

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
    profilePic: string;
  };
  to: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string; // ISO date string
  updatedAt: string;
  __v: number;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );
  const [showRequests, setShowRequests] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const id = localStorage.getItem("userId");
        if (!id) {
          window.location.href = "/login";
          return;
        }

        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/user/open/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${id}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data.data.filter((ele: any) => ele._id !== id));
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrUser = async () => {
      try {
        const id = localStorage.getItem("userId");
        if (!id) {
          window.location.href = "/login";
          return;
        }

        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/user/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${id}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCurrUser(data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchFriendRequests = async () => {
      try {
        const id = localStorage.getItem("userId");
        if (!id) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/friend/friend-requests`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${id}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFriendRequests(data.data.pending || []);
      } catch (err) {
        console.error("Error fetching friend requests:", err);
      }
    };

    fetchCurrUser();
    fetchUsers();
    fetchFriendRequests();
  }, []);

  const handleFriendRequest = async (userId: string) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [userId]: true }));

      const currentUserId = localStorage.getItem("userId");
      if (!currentUserId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friend/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({
            toUserId: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }

      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleIgnore = async (userId: string) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [`ignore_${userId}`]: true }));

      const currentUserId = localStorage.getItem("userId");
      if (!currentUserId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friend/ignore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({
            targetId: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to ignore user");
      }

      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error ignoring user:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`ignore_${userId}`]: false }));
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [`accept_${requestId}`]: true }));

      const currentUserId = localStorage.getItem("userId");
      if (!currentUserId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friend/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({
            fromUserId: requestId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      setFriendRequests(
        friendRequests.filter((req) => req.from._id !== requestId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`accept_${requestId}`]: false,
      }));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [`reject_${requestId}`]: true }));

      const currentUserId = localStorage.getItem("userId");
      if (!currentUserId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friend/request/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({
            requestId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject friend request");
      }

      // Remove the rejected request from the list
      const updatedRequests = friendRequests.filter(
        (req) => req._id !== requestId
      );
      setFriendRequests(updatedRequests);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`reject_${requestId}`]: false,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Connect with People</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
            >
              {showRequests ? "Show Users" : "Friend Requests"}
            </button>
            <Link
              to="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Go to Friends Page
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Connect with People</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
            >
              {showRequests ? "Show Users" : "Friend Requests"}
            </button>
            <Link
              to="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Go to Friends Page
            </Link>
          </div>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const noUsersOrRequests =
    (showRequests && friendRequests.length === 0) ||
    (!showRequests && users.length === 0);

  if (noUsersOrRequests) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {showRequests ? "Friend Requests" : "Connect with People"}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
            >
              {showRequests ? "Show Users" : "Friend Requests"}
            </button>
            <Link
              to="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Go to Friends Page
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showRequests ? "No pending requests" : "No users found"}
          </h3>
          <p className="text-gray-500">
            {showRequests
              ? "You don't have any pending friend requests."
              : "There are currently no other users to connect with."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {currUser && (
        <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden p-4 flex items-center space-x-4 mb-6">
          <img
            src={currUser?.profilePic}
            alt={currUser?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currUser?.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {currUser?.email}
            </p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {showRequests ? "Friend Requests" : "Connect with People"}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            {showRequests ? "Show Users" : "Friend Requests"}
          </button>
          <Link
            to="/chat"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Go to Friends Page
          </Link>
        </div>
      </div>

      {showRequests ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendRequests.map((request, i) => {
            return (
              <div
                key={request._id}
                className="relative bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={
                        request.from.profilePic
                          ? `${request.from.profilePic}?random=${i}`
                          : "https://via.placeholder.com/150"
                      }
                      alt={request.from.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {request.from.name || `User ${request._id.slice(0, 6)}`}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {request.from.email}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/10 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request.from._id)}
                    disabled={loadingActions[`accept_${request._id}`]}
                    className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm cursor-pointer ${
                      loadingActions[`accept_${request._id}`]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loadingActions[`accept_${request._id}`]
                      ? "Accepting..."
                      : "Accept"}
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.from._id)}
                    disabled={loadingActions[`reject_${request._id}`]}
                    className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm cursor-pointer ${
                      loadingActions[`reject_${request._id}`]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loadingActions[`reject_${request._id}`]
                      ? "Rejecting..."
                      : "Reject"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, i) => (
            <div
              key={user._id}
              className="relative bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={
                      user.profilePic
                        ? `${user.profilePic}?random=${i}`
                        : "https://via.placeholder.com/150"
                    }
                    alt={user.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || `User ${user._id.slice(0, 6)}`}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="absolute inset-0 bg-black/10 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleFriendRequest(user._id)}
                  disabled={loadingActions[user._id]}
                  className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm cursor-pointer ${
                    loadingActions[user._id]
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loadingActions[user._id] ? "Sending..." : "Add Friend"}
                </button>
                <button
                  onClick={() => handleIgnore(user._id)}
                  disabled={loadingActions[`ignore_${user._id}`]}
                  className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm cursor-pointer ${
                    loadingActions[`ignore_${user._id}`]
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loadingActions[`ignore_${user._id}`]
                    ? "Processing..."
                    : "Ignore"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
