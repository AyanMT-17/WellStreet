import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Header from '../components/Header';

export default function StockDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  
  // State management
  const [currentPage, setCurrentPage] = useState('stock');
  const [stockData, setStockData] = useState({
    name: '',
    symbol: symbol?.toUpperCase() || '',
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    lastUpdated: null
  });
  
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Trading form states
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeMessage, setTradeMessage] = useState(null);
  
  // Chart time range
  const [timeRange, setTimeRange] = useState('1D');
  const timeRanges = ['1D', '5D', '1M', '3M', '6M', '1Y'];

  // Fetch OHLC data for chart
  const fetchChartData = async (range = '1D') => {
    try {
      setChartLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/market/ohlc/${symbol}?range=${range}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform OHLC data for the chart
      const chartPoints = data.map(item => ({
        timestamp: new Date(item.timestamp).getTime(),
        time: new Date(item.timestamp).toLocaleTimeString(),
        date: new Date(item.timestamp).toLocaleDateString(),
        price: item.close,
        open: item.open,
        high: item.high,
        low: item.low,
        volume: item.volume
      }));
      
      setChartData(chartPoints);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(prev => ({ ...prev, chart: err.message }));
    } finally {
      setChartLoading(false);
    }
  };

  // WebSocket connection for live prices
  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        // Subscribe to price updates for this symbol
        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          symbol: symbol.toUpperCase()
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.symbol === symbol.toUpperCase() && data.type === 'price_update') {
            setStockData(prev => ({
              ...prev,
              price: data.price,
              change: data.change,
              changePercent: data.changePercent,
              volume: data.volume,
              lastUpdated: new Date()
            }));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (symbol) {
            connectWebSocket();
          }
        }, 5000);
      };
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
    }
  };

  // Fetch initial stock info
  const fetchStockInfo = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/market/quote/${symbol}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock info: ${response.status}`);
      }
      
      const data = await response.json();
      setStockData(prev => ({
        ...prev,
        name: data.name || data.companyName || symbol.toUpperCase(),
        price: data.price || data.latestPrice || 0,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        volume: data.volume || 0
      }));
    } catch (err) {
      console.error('Error fetching stock info:', err);
      setError(prev => ({ ...prev, stock: err.message }));
    } finally {
      setLoading(false);
    }
  };

  // Handle trade submission
  const handleTrade = async (e) => {
    e.preventDefault();
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setTradeMessage({ type: 'error', text: 'Please enter a valid quantity' });
      return;
    }

    if (orderType === 'limit' && (!limitPrice || isNaN(limitPrice) || limitPrice <= 0)) {
      setTradeMessage({ type: 'error', text: 'Please enter a valid limit price' });
      return;
    }

    setIsSubmitting(true);
    setTradeMessage(null);

    try {
      const tradeData = {
        symbol: symbol.toUpperCase(),
        quantity: parseInt(quantity),
        type: orderType,
        ...(orderType === 'limit' && { price: parseFloat(limitPrice) })
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/portfolio/${tradeType}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(tradeData)
        }
      );

      const result = await response.json();

      if (response.ok) {
        setTradeMessage({ 
          type: 'success', 
          text: `${tradeType.toUpperCase()} order submitted successfully!` 
        });
        setQuantity('');
        setLimitPrice('');
      } else {
        setTradeMessage({ 
          type: 'error', 
          text: result.message || `Failed to submit ${tradeType} order` 
        });
      }
    } catch (err) {
      console.error('Error submitting trade:', err);
      setTradeMessage({ 
        type: 'error', 
        text: 'Network error. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effects
  useEffect(() => {
    if (symbol) {
      fetchStockInfo();
      fetchChartData(timeRange);
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol]);

  useEffect(() => {
    if (symbol) {
      fetchChartData(timeRange);
    }
  }, [timeRange]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{`${data.date} ${data.time}`}</p>
          <p className="font-semibold text-lg">${data.price.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Volume: {data.volume?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-yellow-200">
//         <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex items-center justify-center h-64">
//             <div className="text-lg text-amber-700">Loading stock data...</div>
//           </div>
//         </main>
//       </div>
//     );
//   }

  const isPositive = stockData.change >= 0;

  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-amber-700 hover:text-amber-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Stock Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">{stockData.symbol}</h1>
              <p className="text-lg text-gray-600">{stockData.name}</p>
              {stockData.lastUpdated && (
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {stockData.lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ${stockData.price.toFixed(2)}
              </div>
              <div className={`flex items-center justify-end text-lg font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <TrendingDown className="w-5 h-5 mr-1" />
                )}
                {isPositive ? '+' : ''}{stockData.change.toFixed(2)} 
                ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Price Chart</h2>
                
                {/* Time Range Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {chartLoading ? (
                <div className="flex items-center justify-center h-96">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Loading chart...</span>
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="time"
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <Activity className="w-6 h-6 mr-2" />
                  No chart data available
                </div>
              )}
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Trade Message */}
            {tradeMessage && (
              <div className={`p-4 rounded-lg border ${
                tradeMessage.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {tradeMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  {tradeMessage.text}
                </div>
              </div>
            )}

            {/* Buy/Sell Toggle */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    tradeType === 'sell'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sell
                </button>
              </div>

              <form onSubmit={handleTrade} className="space-y-4">
                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="market">Market Order</option>
                    <option value="limit">Limit Order</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Number of shares"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Limit Price (only for limit orders) */}
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limit Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="Price per share"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Estimated Total */}
                {quantity && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Estimated Total</div>
                    <div className="text-lg font-semibold">
                      ${((orderType === 'limit' ? parseFloat(limitPrice) || 0 : stockData.price) * parseInt(quantity) || 0).toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </div>
                  ) : (
                    `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} ${stockData.symbol}`
                  )}
                </button>
              </form>
            </div>

            {/* Stock Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Price</span>
                  <span className="font-semibold">${stockData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Change</span>
                  <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume</span>
                  <span className="font-semibold">{stockData.volume.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Errors occurred:</strong>
            <ul className="mt-2">
              {Object.entries(error).map(([key, value]) => (
                <li key={key}>• {key}: {value}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}