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
      <div className="min-h-screen bg-[#fccc07] flex items-center justify-center">
        <div className="flex flex-col items-center bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-black" />
          <p className="text-xl font-black uppercase tracking-widest text-black">Loading Portfolio...</p>
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

  return (
    <div className="min-h-screen bg-[#fccc07]">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-black uppercase tracking-wider inline-block bg-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            Portfolio Overview
          </h1>
          <p className="text-black font-bold mt-4 uppercase tracking-wide bg-white inline-block px-3 border-2 border-black">Your investment holdings and performance.</p>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
        <div className="bg-white border-4 border-black p-0 shadow-[12px_12px_0px_0px_#000]">
          <div className="flex items-center p-6 border-b-4 border-black bg-white">
            <div className="w-12 h-12 border-2 border-black bg-black flex items-center justify-center mr-4 shadow-[4px_4px_0px_0px_#888]">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase tracking-wide">
                Your Stock Positions
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-white uppercase bg-black border-b-4 border-black">
                <tr>
                  <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Symbol</th>
                  <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Quantity</th>
                  <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Avg. Buy Price</th>
                  <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Current Price</th>
                  <th scope="col" className="px-6 py-4 font-black tracking-widest border-r-2 border-white/20">Current Value</th>
                  <th scope="col" className="px-6 py-4 font-black tracking-widest">Unrealized P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {portfolio.positions.map((pos, index) => {
                  const baseSymbol = pos.symbol.replace(/\.NS$/i, '').toUpperCase();
                  const currentPrice = liveData[baseSymbol] || pos.averagePrice;
                  const marketValue = currentPrice * pos.quantity;
                  const unrealizedPL = marketValue - (pos.averagePrice * pos.quantity);

                  return (
                    <tr key={index} className="bg-white hover:bg-yellow-50 transition-colors">
                      <td className="px-6 py-5 font-black text-black border-r-2 border-black">{pos.symbol.replace(/\.NS$/i, '').toUpperCase()}</td>
                      <td className="px-6 py-5 font-bold text-black border-r-2 border-black">{pos.quantity}</td>
                      <td className="px-6 py-5 font-medium text-black border-r-2 border-black">{formatCurrency(pos.averagePrice)}</td>
                      <td className="px-6 py-5 font-medium text-black border-r-2 border-black">{formatCurrency(currentPrice)}</td>
                      <td className="px-6 py-5 font-black text-black border-r-2 border-black">{formatCurrency(marketValue)}</td>
                      <td className={`px-6 py-5 font-black border-l-2 border-black ${unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

const MetricCard = ({ title, value, icon: Icon, isPositive }) => (
  <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000] transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black pb-1 inline-block">{title}</p>
        <div className={`text-3xl font-black mt-2 ${isPositive === true ? 'text-green-600' : isPositive === false ? 'text-red-600' : 'text-black'
          }`}>{value}</div>
      </div>
      <div className="w-14 h-14 border-3 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
        <Icon className="w-8 h-8 text-black stroke-[2.5]" />
      </div>
    </div>
  </div>
);