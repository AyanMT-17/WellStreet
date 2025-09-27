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

  const ws = useRef(null);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        setLoading(true);
        // 1. Fetch the initial watchlist data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);


        const data = await response.json();
        const watchlist = data.watchlist || []; // <-- Access the array here
        // <-- And here
        // 2. If watchlist is not empty, connect to WebSocket for live prices
        setWatchlistData(watchlist);
        const symbolsToTrack = watchlist.map(item => item.symbol.replace('.NS', ''));
        if (symbolsToTrack.length > 0) {
          ws.current = new WebSocket(`${import.meta.env.VITE_WS_URL}`);

          ws.current.onopen = () => {
            console.log('Watchlist WebSocket Connected');
            ws.current.send(JSON.stringify({
              action: 'subscribe',
              symbols: symbolsToTrack,
            }));
          };

          ws.current.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            if (messageData.event === 'price-update') {
              setLivePrices(prevPrices => {
                const updatedPrices = { ...prevPrices };
                for (const tick of messageData.ticks) {
                  updatedPrices[tick.symbol] = tick.price;
                }
                return updatedPrices;
              });
            }
          };

          ws.current.onerror = (err) => {
            console.error("WebSocket error:", err);
            setError("Live price feed disconnected.");
          };
        }
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        setError('Could not fetch your watchlist.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndSubscribe();

    // 3. Cleanup function to close the connection when the component unmounts
    return () => {
      ws.current?.close();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-200 flex items-center justify-center">
        <div className="flex flex-col items-center text-amber-700">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-semibold">Loading Watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-200 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  async function handleaddstock(symbolToAdd) {


    // Make sure a symbol is provided
    if (!symbolToAdd) {
      console.error("No symbol provided to add to watchlist.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist`, { // <-- Comma added here
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // The body is required by your backend
        body: JSON.stringify({ symbol: symbolToAdd })
      });

      if (!response.ok) {
        // Handle HTTP errors like 400 or 500
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedWatchlist = await response.json();
      console.log('Successfully added to watchlist:', updatedWatchlist);
      // Here you would typically update your component's state with the new watchlist
      // For example: setWatchlistData(updatedWatchlist);

    } catch (err) {
      console.error('Failed to add stock to watchlist:', err);
      // Here you would show an error message to the user
    }
  }
  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Watchlist</h1>
            <p className="text-amber-700 mt-2">Monitor your favorite stocks with real-time updates</p>
          </div>
          <form action="">
            <input type="text" value={symbolToAdd} onChange={(e) => setsymbolToAdd(e.target.value)} />
          </form>
          <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
            onClick={
              handleaddstock(symbolToAdd)
            }>
            <Plus className="w-4 h-4 mr-2" />
            Add Stocks
          </button>
        </div>

        {/* Conditional Rendering: Show table or empty state */}
        {watchlistData.length > 0 ? (
          // TABLE VIEW
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-amber-800 uppercase bg-amber-50 rounded-t-lg">
                  <tr>
                    <th scope="col" className="px-6 py-3">Symbol</th>
                    <th scope="col" className="px-6 py-3">Current Price</th>
                    <th scope="col" className="px-6 py-3">Day's Change</th>
                    <th scope="col" className="px-6 py-3">Open Price</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistData.map((item, index) => {
                    const symbol = item.symbol.replace('.NS', '');
                    const livePrice = livePrices[symbol] || item.openPrice;
                    const change = livePrice - item.openPrice;
                    const changePercent = (change / item.openPrice) * 100;
                    const isPositive = change >= 0;

                    return (
                      <tr key={index} className="bg-white border-b border-amber-100 hover:bg-yellow-50/50">
                        <td className="px-6 py-4 font-bold text-amber-900">{symbol}</td>
                        <td className="px-6 py-4 font-semibold">{formatCurrency(livePrice)}</td>
                        <td className={`px-6 py-4 font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          <div className='flex items-center'>
                            {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                            {formatCurrency(change)} ({changePercent.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="px-6 py-4">{formatCurrency(item.openPrice)}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-white/20 text-center min-h-[50vh] flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900 mb-3">Your watchlist is empty</h3>
            <p className="text-amber-700 mb-8 max-w-md">Add stocks to your watchlist to monitor their performance in real-time.</p>
            <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 flex items-center shadow-md hover:shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Stock
            </button>
          </div>
        )}
      </main>
    </div>
  );
}