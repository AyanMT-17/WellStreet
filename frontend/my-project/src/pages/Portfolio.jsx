import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import Header from '../components/Header'; // Assuming Header component exists

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

export default function PortfolioPage() {
  const [currentPage, setCurrentPage] = useState('portfolio');
  const [portfolio, setPortfolio] = useState({ positions: [], cash: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data from an API
    let ws =null
    const fetchPortfolioData = async () => {
    
            

      try {
        // This is where you would make a real API call, e.g., await fetch('/api/portfolio')
        // We'll use a timeout to simulate network delay with the mock data.
        const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log(data)


        setPortfolio({
          cash: data.cash,
          positions: data.positions,
        });

        const symbolsToTrack = data.positions.map(p => p.symbol.replace('.NS', ''));
        if (symbolsToTrack.length === 0){ 
          return;}
        else{
         ws = new WebSocket(`${import.meta.env.VITE_WS_URL}`);
        console.log(ws)
        ws.onopen = () => {
          console.log('Portfolio WebSocket Connected');
          ws.send(JSON.stringify({
              action: 'subscribe',
              symbols: symbolsToTrack
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.event === 'price-update') {
              // Update our liveData state with the new prices
              setLiveData(prevData => {
                  const newData = { ...prevData };
                  for (const tick of data.ticks) {
                      newData[tick.symbol] = tick.price;
                  }
                  return newData;
              });
          }
        };
      }

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
  }, []); // Empty dependency array means this runs once on component mount

  //

  // Calculate overall metrics from the state
  for (const pos of portfolio.positions) {
                try {
                    const livePrice = livePrices[pos.symbol] || pos.averagePrice;
                    holdingsValue += livePrice.regularMarketPrice * pos.quantity;
                } catch (priceError) {
                    
                    holdingsValue += pos.averagePrice * pos.quantity;
                }
            }
  const totalPositionsValue = portfolio.positions.reduce((sum, pos) => sum + pos.averagePrice, 0);
  const totalPortfolioValue = portfolio.cash + totalPositionsValue;
  const totalUnrealizedPL = portfolio.positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-200 flex items-center justify-center">
        <div className="flex flex-col items-center text-amber-700">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-semibold">Loading Portfolio...</p>
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

  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Portfolio Overview
          </h1>
          <p className="text-amber-700 mt-2">Your investment holdings and performance.</p>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Value */}
          <MetricCard
            title="Total Portfolio Value"
            value={formatCurrency(totalPortfolioValue)}
            icon={DollarSign}
            gradient="from-amber-400 to-yellow-500"
          />
          {/* Cash Balance */}
          <MetricCard
            title="Available Cash"
            value={formatCurrency(portfolio.cash)}
            icon={Wallet}
            gradient="from-green-400 to-emerald-500"
          />
          {/* Unrealized P/L */}
          <MetricCard
            title="Unrealized P&L"
            value={formatCurrency(totalUnrealizedPL)}
            icon={TrendingUp}
            isPositive={totalUnrealizedPL >= 0}
            gradient={totalUnrealizedPL >= 0 ? 'from-sky-400 to-cyan-500' : 'from-red-400 to-rose-500'}
          />
        </div>

        {/* Detailed Positions Table */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-200/50">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mr-4 shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Your Stock Positions
              </h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-amber-800 uppercase bg-amber-50 rounded-t-lg">
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
                {portfolio.positions.map((pos, index) => (
                  <tr key={index} className="bg-white border-b border-amber-100 hover:bg-yellow-50/50">
                    <td className="px-6 py-4 font-bold text-amber-900">{pos.symbol}</td>
                    <td className="px-6 py-4">{pos.quantity}</td>
                    <td className="px-6 py-4">{formatCurrency(pos.averagePrice.toFixed(2))}</td>
                    <td className="px-6 py-4">{formatCurrency(currentPrice.toFixed(2))}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(marketValue.toFixed(2))}</td>
                    <td className={`px-6 py-4 font-semibold ${pos.unrealizedPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(pos.unrealizedPL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// A reusable Metric Card component to keep the main component clean
const MetricCard = ({ title, value, icon: Icon, gradient, isPositive }) => (
  <div className="group bg-white rounded-xl p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-amber-700 mb-1">{title}</p>
        <span className={`text-2xl font-bold ${
          isPositive === true ? 'text-emerald-600' : isPositive === false ? 'text-red-600' : 'text-amber-900'
        }`}>{value}</span>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);