"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, logout } = useUser();
  const router = useRouter();

  if (user == null || user.email === "") {
    router.push("/login");
  }

  return (
    <div>
      <h1>Welcome, {user?.username || "Guest"}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
