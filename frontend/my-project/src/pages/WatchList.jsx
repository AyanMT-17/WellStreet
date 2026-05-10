import React, { useState, useEffect, useRef } from 'react';
import { Eye, Plus, Loader2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Header from '../components/Header';

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
};

export default function WatchlistPage() {
  const [currentPage, setCurrentPage] = useState('watchlist');
  const [watchlistData, setWatchlistData] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbolToAdd, setsymbolToAdd] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });


  const fetchWatchlist = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const watchlist = data.watchlist || [];
      setWatchlistData(watchlist);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Could not fetch your watchlist.');
    }
  };

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      setLoading(true);
      await fetchWatchlist();
      setLoading(false);
    };

    fetchAndSubscribe();

    return () => { };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fccc07] flex items-center justify-center">
        <div className="flex flex-col items-center bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-black" />
          <p className="text-xl font-black uppercase tracking-widest text-black">Loading Watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fccc07] flex items-center justify-center">
        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <p className="text-xl font-black text-red-600 uppercase">{error}</p>
        </div>
      </div>
    );
  }

  async function handleaddstock(symbolToAdd) {
    if (!symbolToAdd || !symbolToAdd.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid symbol.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol: symbolToAdd })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setMessage({ type: 'success', text: `${symbolToAdd.toUpperCase()} added to watchlist!` });
      setsymbolToAdd('');
      await fetchWatchlist(); // Refresh the list
    } catch (err) {
      console.error('Failed to add stock to watchlist:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to add stock.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  }

  async function handleDeleteStock(symbol) {
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete');
      }

      setMessage({ type: 'success', text: `${symbol.replace('.NS', '')} removed from watchlist!` });
      await fetchWatchlist(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete stock:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to delete stock.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  }
  return (
    <div className="min-h-screen bg-[#fccc07]">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-black uppercase tracking-wider inline-block bg-white px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_#000] lg:rotate-1">Watchlist</h1>
            <p className="text-black font-bold mt-4 uppercase tracking-wide bg-white inline-block px-3 border-2 border-black lg:rotate-[-1deg]">Monitor your favorite stocks</p>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <input
              type="text"
              value={symbolToAdd}
              onChange={(e) => setsymbolToAdd(e.target.value)}
              placeholder="ADD SYMBOL..."
              className="px-3 py-2 border-3 border-black font-bold text-black uppercase placeholder-gray-500 focus:outline-none focus:bg-yellow-100 w-48"
            />
            <button
              className="bg-black text-white px-4 py-2 border-2 border-black font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center shadow-[2px_2px_0px_0px_#888] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleaddstock(symbolToAdd)}
              disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span className="ml-2 hidden sm:inline">{actionLoading ? 'ADDING...' : 'ADD'}</span>
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-8 p-4 border-4 font-bold flex items-center uppercase shadow-[4px_4px_0px_0px_#000] ${message.type === 'success' ? 'bg-[#a3e635] border-black text-black' : 'bg-[#f87171] border-black text-black'}`}>
            {message.text}
          </div>
        )}

        {/* Conditional Rendering: Show table or empty state */}
        {watchlistData.length > 0 ? (
          // TABLE VIEW
          <div className="bg-white border-4 border-black p-0 shadow-[12px_12px_0px_0px_#000]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-white uppercase bg-black border-b-4 border-black">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Symbol</th>
                    <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Current Price</th>
                    <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Day's Change</th>
                    <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Open Price</th>
                    <th scope="col" className="px-6 py-4 font-black tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {watchlistData.map((item, index) => {
                    const symbol = item.symbol.replace('.NS', '');
                    const livePrice = livePrices[symbol] || item.openPrice;
                    const change = livePrice - item.openPrice;
                    const changePercent = (change / item.openPrice) * 100;
                    const isPositive = change >= 0;

                    return (
                      <tr key={index} className="bg-white hover:bg-yellow-50 transition-colors">
                        <td className="px-6 py-5 font-black text-black border-r-2 border-black">{symbol}</td>
                        <td className="px-6 py-5 font-bold text-black border-r-2 border-black">{formatCurrency(livePrice)}</td>
                        <td className={`px-6 py-5 font-black border-r-2 border-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          <div className='flex items-center'>
                            {isPositive ? <TrendingUp size={18} className="mr-2" /> : <TrendingDown size={18} className="mr-2" />}
                            {formatCurrency(change)} ({changePercent.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="px-6 py-5 font-medium text-black border-r-2 border-black">{formatCurrency(item.openPrice)}</td>
                        <td className="px-6 py-5 text-right">
                          <button
                            className="text-black hover:text-red-600 transition-colors disabled:opacity-50 p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black"
                            onClick={() => handleDeleteStock(item.symbol || item)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={20} className="stroke-[2.5]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // EMPTY STATE VIEW
          <div className="bg-white border-4 border-black p-12 shadow-[12px_12px_0px_0px_#000] text-center min-h-[50vh] flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-black text-white rounded-none border-4 border-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_0px_#888]">
              <Eye className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase mb-4 tracking-wide">Your watchlist is empty</h3>
            <p className="text-black font-medium mb-8 max-w-md text-lg">Add stocks to your watchlist to monitor their performance in real-time.</p>
            <button className="bg-[#fccc07] text-black px-8 py-4 border-4 border-black font-black uppercase tracking-widest hover:bg-white transition-all shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] flex items-center">
              <Plus className="w-6 h-6 mr-3 stroke-[3]" />
              Add Your First Stock
            </button>
          </div>
        )}
      </main>
    </div>
  );
}