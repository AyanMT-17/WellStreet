import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import Header from '../components/Header';

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function PortfolioPage() {
  const [currentPage, setCurrentPage] = useState('portfolio');
  const [portfolio, setPortfolio] = useState({ positions: [], cash: 0 });
  const [liveData, setLiveData] = useState({}); // Added state for live prices
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ws = null;
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        setPortfolio({
          cash: data.cash,
          positions: data.positions,
        });

  // Normalize symbols to base form (remove .NS if present) and uppercase so keys match server-side cache
  const symbolsToTrack = data.positions.map(p => p.symbol.replace(/\.NS$/i, '').toUpperCase());
        if (symbolsToTrack.length === 0) {
            setLoading(false);
            return;
        }

        ws = new WebSocket(`${import.meta.env.VITE_WS_URL}`);
        
        ws.onopen = () => {
          console.log('Portfolio WebSocket Connected');
          ws.send(JSON.stringify({
              action: 'subscribe',
              symbols: symbolsToTrack
          }));
        };

        ws.onmessage = (event) => {
          const messageData = JSON.parse(event.data);
          if (messageData.event === 'price-update') {
            setLiveData(prevData => {
                const newData = { ...prevData };
                for (const tick of messageData.ticks) {
                    // Server sends symbols like 'TCS.NS' — normalize to base symbol 'TCS' for keys
                    const base = tick.symbol.replace(/\.NS$/i, '').toUpperCase();
                    newData[base] = tick.price;
                }
                
                return newData;
            });
          }
        };

      } catch (err) {
        setError('Failed to fetch portfolio data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();

    return () => {
        if (ws) {
            ws.close();
        }
    };
  }, []);

  // Calculations are now done inside the component render body
  const holdingsValue = portfolio.positions.reduce((sum, pos) => {
    const baseSymbol = pos.symbol.replace(/\.NS$/i, '').toUpperCase();
    const currentPrice = liveData[baseSymbol] || pos.averagePrice;
    return sum + (currentPrice * pos.quantity);
  }, 0);

  const totalInvestment = portfolio.positions.reduce((sum, pos) => sum + (pos.averagePrice * pos.quantity), 0);
  const totalPortfolioValue = portfolio.cash + holdingsValue;
  const totalUnrealizedPL = holdingsValue - totalInvestment;

  if (loading) {
    return (
      // THEME UPDATE: Loading state styles updated
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-semibold">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    // THEME UPDATE: Main background color changed
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          {/* THEME UPDATE: Header text changed to solid gray */}
          <h1 className="text-3xl font-bold text-gray-800">
            Portfolio Overview
          </h1>
          <p className="text-gray-500 mt-2">Your investment holdings and performance.</p>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Portfolio Value"
            value={formatCurrency(totalPortfolioValue)}
            icon={DollarSign}
          />
          <MetricCard
            title="Available Cash"
            value={formatCurrency(portfolio.cash)}
            icon={Wallet}
          />
          <MetricCard
            title="Unrealized P&L"
            value={formatCurrency(totalUnrealizedPL)}
            icon={TrendingUp}
            isPositive={totalUnrealizedPL >= 0}
          />
        </div>

        {/* Detailed Positions Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            {/* THEME UPDATE: Header icon changed to neutral gray */}
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Your Stock Positions
              </h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              {/* THEME UPDATE: Table header styles changed */}
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Symbol</th>
                  <th scope="col" className="px-6 py-3">Quantity</th>
                  <th scope="col" className="px-6 py-3">Avg. Buy Price</th>
                  <th scope="col" className="px-6 py-3">Current Price</th>
                  <th scope="col" className="px-6 py-3">Current Value</th>
                  <th scope="col" className="px-6 py-3">Unrealized P/L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((pos, index) => {
                  // Calculate row-specific values here
                  const baseSymbol = pos.symbol.replace(/\.NS$/i, '').toUpperCase();
                  const currentPrice = liveData[baseSymbol] || pos.averagePrice;
                  const marketValue = currentPrice * pos.quantity;
                  const unrealizedPL = marketValue - (pos.averagePrice * pos.quantity);

                  return (
                    <tr key={index} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{pos.symbol.replace(/\.NS$/i, '').toUpperCase()}</td>
                      <td className="px-6 py-4 text-gray-700">{pos.quantity}</td>
                      <td className="px-6 py-4 text-gray-700">{formatCurrency(pos.averagePrice)}</td>
                      <td className="px-6 py-4 text-gray-700">{formatCurrency(currentPrice)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(marketValue)}</td>
                      <td className={`px-6 py-4 font-semibold ${unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(unrealizedPL)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// THEME UPDATE: Reusable Metric Card component with new neutral styles
const MetricCard = ({ title, value, icon: Icon, isPositive }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <span className={`text-2xl font-bold ${
          isPositive === true ? 'text-green-600' : isPositive === false ? 'text-red-600' : 'text-gray-800'
        }`}>{value}</span>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-500" />
      </div>
    </div>
  </div>
);