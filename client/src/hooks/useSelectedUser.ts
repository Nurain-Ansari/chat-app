import { useState, useEffect } from "react";
import type { Friend, Member } from "../types/interface";

export function useSelectedUser(friends: Friend[], selectedChatId: string) {
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);

  useEffect(() => {
    const selectedFr = friends.find((ele) => ele._id === selectedChatId)
      ?.members[0];
    if (selectedFr) {
      setSelectedUser(selectedFr);
    }
  }, [friends, selectedChatId]);

  return { selectedUser, setSelectedUser };
}
