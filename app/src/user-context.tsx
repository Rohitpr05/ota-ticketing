import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_USER_ID } from "./users";

type UserContextValue = {
  userId: number;
  setUserId: (userId: number) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  return <UserContext value={{ userId, setUserId }}>{children}</UserContext>;
}

export function useCurrentUser(): UserContextValue {
  const value = useContext(UserContext);
  if (!value) {
    throw new Error("useCurrentUser must be used inside <UserProvider>");
  }
  return value;
}
