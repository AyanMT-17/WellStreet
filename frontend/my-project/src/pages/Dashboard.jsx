import React, { useState } from 'react';
import { Search, TrendingUp, Eye, Plus, BarChart3, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function TradingDashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const marketData = [
    { symbol: 'SPY', name: 'S&P 500', price: 445.67, change: 2.34, changePercent: 0.53, positive: true },
    { symbol: 'QQQ', name: 'NASDAQ', price: 378.92, change: -1.23, changePercent: -0.32, positive: false },
    { symbol: 'DIA', name: 'Dow Jones', price: 356.78, change: 0.89, changePercent: 0.25, positive: true }
  ];

  const topMovers = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 4.23, changePercent: 2.28, positive: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.67, change: -8.34, changePercent: -3.24, positive: false },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.92, change: 5.67, changePercent: 1.52, positive: true }
  ];

  const quickActions = [
    { icon: Eye, label: 'View Watchlist', description: 'Monitor your selected stocks', path: '/watchlist' },
    { icon: Plus, label: 'Place Order', description: 'Buy or sell securities', path: '/orders' },
    { icon: BarChart3, label: 'Portfolio', description: 'View your holdings', path: '/portfolio' },
    { icon: Award, label: 'Leaderboard', description: 'Compare performance', path: '/leaderboard' }
  ];

  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Page Title */}
        <div className="mb-8 relative">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Trading Dashboard</h1>
          <p className="text-amber-700 mt-2">Monitor markets, search stocks, and manage your portfolio</p>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {marketData.map((market) => (
            <div key={market.symbol} className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:border-white/40 relative overflow-hidden hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-amber-900">{market.name}</h3>
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {market.symbol}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-800">${market.price}</span>
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  market.positive 
                    ? 'text-emerald-600 bg-emerald-100/80 border border-emerald-200/50' 
                    : 'text-red-600 bg-red-100/80 border border-red-200/50'
                  } px-3 py-1 rounded-full inline-block shadow-sm`}>
                  <span>{market.positive ? '+' : ''}{market.change} ({market.positive ? '+' : ''}{market.changePercent}%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center mb-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center mr-3 shadow-md">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Stock Search</h2>
                <p className="text-amber-700 text-sm">Search for stocks to add to your watchlist or place orders</p>
              </div>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stocks by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-amber-50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:bg-white"
              />
            </div>
          </div>

          {/* Top Movers */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center mb-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center mr-3 shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">Top Movers</h2>
                <p className="text-gray-600 text-sm">Stocks with the biggest price movements today</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topMovers.map((stock) => (
                <div 
                  key={stock.symbol} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50/30 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${stock.positive ? 'bg-emerald-50' : 'bg-red-50'} flex items-center justify-center`}>
                      <span className="font-semibold text-sm">{stock.symbol}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${stock.price}</div>
                    <div className={`text-sm font-medium ${
                      stock.positive 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-red-600 bg-red-50'
                    } px-2 py-0.5 rounded-full inline-block`}>
                      {stock.positive ? '+' : ''}{stock.change} ({stock.positive ? '+' : ''}{stock.changePercent}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h2>
          <p className="text-gray-600 text-sm mb-6">Access your most used features</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    const page = action.path.substring(1) || 'dashboard';
                    setCurrentPage(page);
                    navigate(action.path);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 hover:shadow-md hover:bg-gradient-to-r hover:from-indigo-50 hover:to-teal-50 transition-all duration-200 text-left group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-100 to-indigo-100 flex items-center justify-center mb-3 group-hover:from-teal-200 group-hover:to-indigo-200 transition-all duration-200">
                      <Icon className="w-6 h-6 text-indigo-600 group-hover:text-indigo-700" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{action.label}</h3>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}