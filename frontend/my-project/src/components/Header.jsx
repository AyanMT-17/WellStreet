import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  BarChart3,
  ChartNoAxesCombined,
  Eye,
  Grid3X3,
  ShoppingCart,
} from "lucide-react";
import { useAppSession } from "../context/appSession";

const navigationItems = [
  { key: "dashboard", label: "Dashboard", icon: Grid3X3 },
  { key: "watchlist", label: "Watchlist", icon: Eye },
  { key: "Stockpage", label: "Stockpage", icon: ChartNoAxesCombined },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAppSession();

  const currentPage = location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center border border-stone-200 bg-stone-900 text-sm font-semibold text-stone-50 shadow-sm">
              W
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Trading Suite
              </div>
              <div className="text-xl font-semibold tracking-tight text-stone-900">
                WellStreet
              </div>
            </div>
          </button>

          <nav className="hidden flex-1 justify-center xl:flex">
            <div className="flex flex-wrap items-center gap-2 border border-stone-200 bg-stone-50 p-1 shadow-sm">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.key === "dashboard" ? "/" : `/${item.key}`)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm transition ${
                      isActive
                        ? "border border-stone-900 bg-stone-900 text-stone-50"
                        : "border border-transparent bg-transparent text-stone-600 hover:border-stone-300 hover:bg-white hover:text-stone-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                className="subtle-button"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={() => navigate("/login")}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.key === "dashboard" ? "/" : `/${item.key}`)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] ${
                  isActive ? "bg-stone-900 text-stone-50" : "text-stone-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
