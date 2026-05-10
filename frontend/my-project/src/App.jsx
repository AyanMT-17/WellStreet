import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import Login from "./pages/Login";
import StockDetailPage from "./pages/stockdetail";
import WatchlistPage from "./pages/WatchList";
import { AppSessionProvider } from "./context/AppSessionContext";
import { ProtectedLayout, PublicLayout } from "./components/AppShell";

const router = createBrowserRouter([
  {
    element: (
      <AppSessionProvider>
        <Outlet />
      </AppSessionProvider>
    ),
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/Stockpage", element: <StockDetailPage /> },
          { path: "/watchlist", element: <WatchlistPage /> },
        ],
      },
      {
        element: <PublicLayout />,
        children: [{ path: "/login", element: <Login /> }],
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
