import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, List, ShoppingCart, BarChart3, Award, ChartNoAxesCombined } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage }) {
  const navigate = useNavigate();
  
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Grid3X3 },
    { key: 'watchlist', label: 'Watchlist', icon: List },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'portfolio', label: 'Portfolio', icon: BarChart3 },
    { key: 'leaderboard', label: 'Leaderboard', icon: Award },
    { key: 'Stockpage', label: 'Stockpage', icon: ChartNoAxesCombined}
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

  const handleLogout = async() => {
    // Clear the cookie by setting its expiration date to the past
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "GET",
      credentials: "include" // important so cookies are sent
    });

    const data = await res.json();
    // Update the application's state
    setLoggedIn(false);

    // Redirect the user
    navigate('/login');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-amber-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white w-8 h-8 rounded-md flex items-center justify-center font-bold shadow-md">
                W
              </div>
              <span className="ml-2 text-xl font-semibold text-amber-900">WellStreet</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
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
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                        : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            {/* Sign In Button */}
            {loggedIn ? (
              // This will show if loggedIn is true
              <button
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              // This will show if loggedIn is false
              <button
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-amber-200/50">
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
                className={`flex flex-col items-center py-2 px-1 rounded-md text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}