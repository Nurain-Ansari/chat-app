// src/socket.ts
import { io } from "socket.io-client";

// const baseUrl = import.meta.env.BASE_URL || "";

const socket = io("http://localhost:5000", {
  autoConnect: true,
  path: "/api/socket.io",
});

export default socket;
