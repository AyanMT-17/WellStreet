import { createContext, useContext } from "react";

export const AppSessionContext = createContext(null);

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (!context) {
    throw new Error("useAppSession must be used within AppSessionProvider");
  }
  return context;
}
