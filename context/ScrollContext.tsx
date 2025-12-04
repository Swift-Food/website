"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ScrollContextType {
  hideNavbar: boolean;
  setHideNavbar: (hide: boolean) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [hideNavbar, setHideNavbar] = useState(false);

  return (
    <ScrollContext.Provider value={{ hideNavbar, setHideNavbar }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within ScrollProvider");
  }
  return context;
}