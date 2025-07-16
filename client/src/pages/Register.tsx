import { useState } from "react";
import { useNavigate } from "react-router-dom";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  profilePic: string;
};

const Register = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    profilePic: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("data: ", data);

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("userId", data._id);
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full px-4 py-2 mb-4 border rounded"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full px-4 py-2 mb-4 border rounded"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-4 border rounded"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="profilePic"
          placeholder="Profile Picture URL or name (optional)"
          className="w-full px-4 py-2 mb-4 border rounded"
          value={formData.profilePic}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
