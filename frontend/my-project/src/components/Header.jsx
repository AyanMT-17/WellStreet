import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, ShoppingCart, BarChart3, Award, ChartNoAxesCombined } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage }) {
  const navigate = useNavigate();
  
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Grid3X3 },
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
      {/* THEME UPDATE: Border color changed from amber to gray */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              {/* THEME UPDATE: Logo background changed to dark gray */}
              <div className="bg-gray-800 text-white w-8 h-8 rounded-md flex items-center justify-center font-bold shadow-sm">
                W
              </div>
              {/* THEME UPDATE: Logo text changed to dark gray */}
              <span className="ml-2 text-xl font-semibold text-gray-800">WellStreet</span>
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
                    // THEME UPDATE: Button styles changed to a neutral gray theme
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Sign In / Logout Button */}
            {loggedIn ? (
              <button
                // THEME UPDATE: Logout button style updated for consistency
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button
                // THEME UPDATE: Sign In button style updated for consistency
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {/* THEME UPDATE: Border color changed from amber to gray */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
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
                // THEME UPDATE: Mobile button styles updated to match desktop
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs transition-colors w-full ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
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