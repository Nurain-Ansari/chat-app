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

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);
  console.log(users);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Select a user to chat</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user?._id}>
            <Link
              to={`/chat/${user._id}`}
              className="block p-4 bg-white rounded shadow hover:bg-blue-100 transition"
            >
              {user.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
