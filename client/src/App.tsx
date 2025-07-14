import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat/:senderId/:receiverId" element={<Chat />} />
    </Routes>
  );
}
