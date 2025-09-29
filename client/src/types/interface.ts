export interface Message {
  chatId: string;
  senderId: {
    _id: string;
    name: string;
    profilePic: string;
  };
  content: string;
  messageType?: "text" | "image" | "video" | "file";
  status: "sent" | "delivered" | "read";
  reactions?: {
    user: string;
    emoji: string;
  }[];
  seenBy?: string[];
  createdAt?: string;
  updatedAt?: string;
  _id: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  __v: number;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
}

export interface Friend {
  _id: string;
  isGroup: boolean;
  members: Member[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// export interface Message {
//   _id?: string;
//   sender: string;
//   receiver: string;
//   content: string;
//   createdAt?: string;
//   updatedAt?: string;
//   timestamp?: string;
//   __v?: number;
//   status?: "sent" | "delivered" | "read";
// }

// export interface PendingResponse {
//   pending: {
//     _id: string;
//     // from: Member;
//     to: string;
//     status: "pending";
//     createdAt: string; // ISO date string
//     updatedAt: string; // ISO date string
//     __v: number;
//   }[];
// }
