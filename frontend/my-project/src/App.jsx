import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardPage from "./pages/Dashboard";
import OrdersPage from "./pages/Orders";
import PortfolioPage from "./pages/Portfolio";
import LeaderboardPage from "./pages/LeaderBoard";
import Login from "./pages/Login"; // Your login component
import StockDetailPage from "./pages/stockdetail";
import WatchlistPage from "./pages/WatchList";
// ---------------- Protected Route ----------------
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/profile", {
          method: "GET",
          credentials: "include", // send cookies
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("user", JSON.stringify(data)); // optional, for quick access
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fccc07]">
        <div className="text-center p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4 border-2 border-white animate-bounce">
            <span className="text-white font-black text-4xl">W</span>
          </div>
          <p className="text-black font-bold uppercase tracking-widest text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ---------------- Public Route ----------------
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/profile", {
          method: "GET",
          credentials: "include",
        });

        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fccc07]">
        <div className="text-center p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4 border-2 border-white animate-bounce">
            <span className="text-white font-black text-4xl">W</span>
          </div>
          <p className="text-black font-bold uppercase tracking-widest text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// ---------------- Router ----------------
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute>
        <OrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/portfolio",
    element: (
      <ProtectedRoute>
        <PortfolioPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/leaderboard",
    element: (
      <ProtectedRoute>
        <LeaderboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/Stockpage",
    element: (
      <ProtectedRoute>
        <StockDetailPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/watchlist",
    element: (
      <ProtectedRoute>
        <WatchlistPage />
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
