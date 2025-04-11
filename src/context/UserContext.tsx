"use client"; // Required for using state & context in Next.js App Router

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the user type (optional, but recommended for TypeScript)
type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string; // Optional profile picture
} | null;

// Create the Context
const UserContext = createContext<{
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
} | null>(null);

// Context Provider Component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("user") || "null");
    }
    return null;
  });

  // Persist user state in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook to Use the Context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

