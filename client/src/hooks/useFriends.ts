import { useEffect, useState } from "react";
import type { Friend } from "../types/interface";

export function useFriends(currUserId: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/mine`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currUserId}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setFriends(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch friends");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch friends"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currUserId]);

  return { friends, loading, error };
}
