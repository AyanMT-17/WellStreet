import React, { useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import Header from '../components/Header';

export default function WatchlistPage() {
  const [currentPage, setCurrentPage] = useState('watchlist');

  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-yellow-100/20 opacity-50 pointer-events-none"></div>
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 relative">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Watchlist</h1>
            <p className="text-amber-700 mt-2">Monitor your favorite stocks with real-time updates</p>
          </div>
          
          {/* Add Stocks Button */}
          <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 flex items-center shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Add Stocks
          </button>
        </div>

        {/* Empty State Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group relative overflow-hidden min-h-96">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center relative z-10">
            {/* Eye Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-8 h-8 text-white" />
            </div>
            
            {/* Empty State Text */}
            <h3 className="text-xl font-semibold text-amber-900 mb-3">
              Your watchlist is empty
            </h3>
            <p className="text-amber-700 mb-8 max-w-md">
              Add stocks to your watchlist to monitor their performance in real-time.
            </p>
            
            {/* Add First Stock Button */}
            <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-md font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 flex items-center shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Stock
            </button>
          </div>
        </div>
      </main>


    </div>
  );
}