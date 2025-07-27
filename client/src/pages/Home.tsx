/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string; // optional if not returned
  profilePic?: string;
}
export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currUser, setCurrUser] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("userId") || "";
    if (!id) {
      window.location.href = "/login";
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/user/open/${id}`)
      .then((res) => res.json())
      .then((data) => setUsers(data.data.filter((ele: any) => ele._id !== id)))
      .catch((error) => console.error("Error fetching users:", error));

    setCurrUser(id);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Select a user to chat</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user?._id}>
            <Link
              to={`/chat/${currUser}/${user._id}`}
              className="block p-4 bg-white rounded shadow hover:bg-blue-100 transition"
            >
              {user.name || `Hello ${user._id}`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
