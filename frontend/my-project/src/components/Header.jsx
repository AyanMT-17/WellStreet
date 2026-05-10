import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, ShoppingCart, BarChart3, Award, ChartNoAxesCombined, Eye } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage }) {
  const navigate = useNavigate();

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Grid3X3 },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'portfolio', label: 'Portfolio', icon: BarChart3 },
    { key: 'watchlist', label: 'Watchlist', icon: Eye },
    { key: 'leaderboard', label: 'Leaderboard', icon: Award },
    { key: 'Stockpage', label: 'Stockpage', icon: ChartNoAxesCombined }
  ];

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data:', data);
          setLoggedIn(!!data);
        } else {
          setLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoggedIn(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();
    setLoggedIn(false);
    navigate('/login');
  };

  return (
    <>
      {/* Header */}
      {/* THEME UPDATE: Removed blur, added solid bg, thick border */}
      <header className="bg-white border-b-3 border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <div className="flex items-center">
              {/* THEME UPDATE: Hard bordered logo box */}
              <div className="bg-black text-white w-10 h-10 border-2 border-black flex items-center justify-center font-bold shadow-[4px_4px_0px_0px_#00000040]">
                W
              </div>
              {/* THEME UPDATE: Uppercase bold text */}
              <span className="ml-3 text-2xl font-black uppercase tracking-tighter text-black">WellStreet</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setCurrentPage(item.key);
                      navigate(item.key === 'dashboard' ? '/' : `/${item.key}`);
                    }}
                    // THEME UPDATE: Neubrutalist buttons: thick border, hard shadow, transform on active
                    className={`flex items-center px-4 py-2 rounded-none border-2 border-black text-sm font-bold transition-all duration-100 ${isActive
                        ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" strokeWidth={3} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Sign In / Logout Button */}
            {loggedIn ? (
              <button
                // THEME UPDATE: Brutalist action button
                className="bg-red-400 border-2 border-black text-black px-5 py-2 rounded-none text-sm font-bold shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button
                // THEME UPDATE: Brutalist action button
                className="bg-green-400 border-2 border-black text-black px-5 py-2 rounded-none text-sm font-bold shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-3 border-black z-50 pb-2">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setCurrentPage(item.key);
                  navigate(item.key === 'dashboard' ? '/' : `/${item.key}`);
                }}
                // THEME UPDATE: Simplified for mobile, but keeping high contrast
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-none border-2 border-transparent transition-colors w-full ${isActive
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-gray-200'
                  }`}
              >
                <Icon className="w-5 h-5 mb-1" strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}