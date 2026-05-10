import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { clearCache, readCache, writeCache } from "../utils/cache";
import { AppSessionContext } from "./appSession";

const API_URL = import.meta.env.VITE_API_URL;
const CACHE_TTL = 2 * 60 * 1000;

const initialUser = (() => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : readCache("profile", 5 * 60 * 1000);
  } catch {
    return readCache("profile", 5 * 60 * 1000);
  }
})();

export function AppSessionProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [authLoading, setAuthLoading] = useState(!initialUser);
  const [watchlist, setWatchlist] = useState(readCache("watchlist", CACHE_TTL));
  const [dataLoading, setDataLoading] = useState({
    watchlist: !readCache("watchlist", CACHE_TTL),
  });

  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  const addNotification = useCallback((msg, type = 'signal') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 10000);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("user");
    clearCache("profile");
    clearCache("watchlist");
    setUser(null);
    setWatchlist(null);
    setIsAuthenticated(false);
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        clearSession();
        return false;
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data));
      writeCache("profile", data);
      setUser(data);
      setIsAuthenticated(true);
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [clearSession]);

  const refreshWatchlist = useCallback(async () => {
    setDataLoading((prev) => ({ ...prev, watchlist: true }));
    try {
      const response = await fetch(`${API_URL}/watchlist`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch watchlist");
      const data = await response.json();
      setWatchlist(data);
      writeCache("watchlist", data);
      return data;
    } finally {
      setDataLoading((prev) => ({ ...prev, watchlist: false }));
    }
  }, []);

  const updateWatchlist = useCallback(async (symbol, action) => {
    try {
      const method = action === 'add' ? 'POST' : 'DELETE';
      const url = action === 'add' ? `${API_URL}/watchlist` : `${API_URL}/watchlist/${symbol}`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: action === 'add' ? JSON.stringify({ symbol }) : undefined,
        credentials: 'include',
      });

      if (response.ok) {
        await refreshWatchlist();
        addNotification(`${symbol} ${action === 'add' ? 'added to' : 'removed from'} watchlist`);
      }
    } catch (err) {
      console.error('Watchlist update error:', err);
    }
  }, [refreshWatchlist, addNotification]);

  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      await response.json();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (wsRef.current) wsRef.current.close();
      return;
    }

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: 'auth', userId: user.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'volatility-alert') {
          addNotification(data.message, 'volatility');
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshWatchlist().catch(() => {});
  }, [isAuthenticated, refreshWatchlist]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      authLoading,
      watchlist,
      dataLoading,
      refreshAuth,
      refreshWatchlist,
      updateWatchlist,
      logout,
      notifications,
      removeNotification: (id) => setNotifications(prev => prev.filter(n => n.id !== id))
    }),
    [user, isAuthenticated, authLoading, watchlist, dataLoading, refreshAuth, refreshWatchlist, updateWatchlist, logout, notifications]
  );

  return (
    <AppSessionContext.Provider value={value}>
      {children}
      <NotificationToast notifications={notifications} />
    </AppSessionContext.Provider>
  );
}

function NotificationToast({ notifications }) {
  if (notifications.length === 0) return null;
  return (
    <div className="fixed bottom-24 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className={`${
          n.type === 'volatility' ? 'bg-red-950 border-red-500 text-red-50' : 'bg-stone-900 border-stone-800 text-stone-50'
        } border p-4 shadow-xl min-w-[280px] pointer-events-auto transition-all animate-in slide-in-from-right-10`}>
          <div className={`text-[10px] font-bold uppercase mb-1 tracking-widest ${
            n.type === 'volatility' ? 'text-red-400' : 'text-stone-400'
          }`}>
            {n.type === 'volatility' ? 'Volatility Warning' : 'System Signal'}
          </div>
          <p className="font-medium text-sm">{n.message}</p>
        </div>
      ))}
    </div>
  );
}
