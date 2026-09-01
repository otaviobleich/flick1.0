"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { UserId } from "./types";

interface CurrentUserContextValue {
  userId: UserId | null;
  setUserId: (id: UserId) => void;
  ready: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  userId: null,
  setUserId: () => {},
  ready: false,
});

const STORAGE_KEY = "flick.currentUser";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<UserId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "otavio" || stored === "larissa") {
      setUserIdState(stored);
    }
    setReady(true);
  }, []);

  function setUserId(id: UserId) {
    window.localStorage.setItem(STORAGE_KEY, id);
    setUserIdState(id);
  }

  return (
    <CurrentUserContext.Provider value={{ userId, setUserId, ready }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
