import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    localStorage.setItem("userId", "");
    window.location.href = "/login";
    return;
  }, []);
  return <></>;
}
