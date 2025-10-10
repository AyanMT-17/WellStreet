import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    TrendingUp, 
    TrendingDown, 
    Activity,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    ChevronDown
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    ReferenceLine,
    Line
} from 'recharts';
import Header from '../components/Header';


// --- CONFIGURATION ---
const VITE_API_URL = import.meta.env.VITE_API_URL
const VITE_WS_URL = import.meta.env.VITE_WS_URL

// --- SELF-CONTAINED HEADER COMPONENT ---

// NIFTY 50 stock list
const SYMBOLS_TO_TRACK = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'INFY.NS',
    'BHARTIARTL.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'ITC.NS', 'LT.NS',
    'BAJFINANCE.NS', 'HCLTECH.NS', 'KOTAKBANK.NS', 'AXISBANK.NS', 'MARUTI.NS',
    'ASIANPAINT.NS', 'TATASTEEL.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'ULTRACEMCO.NS',
    'WIPRO.NS', 'TATAMOTORS.NS', 'ADANIENT.NS', 'NESTLEIND.NS', 'M&M.NS',
    'POWERGRID.NS', 'BAJAJFINSV.NS', 'NTPC.NS', 'JSWSTEEL.NS', 'LTIM.NS',
    'HDFCLIFE.NS', 'DRREDDY.NS', 'ADANIPORTS.NS', 'HINDALCO.NS', 'TATACONSUM.NS',
    'CIPLA.NS', 'GRASIM.NS', 'COALINDIA.NS', 'INDUSINDBK.NS', 'BRITANNIA.NS',
    'EICHERMOT.NS', 'SBILIFE.NS', 'HEROMOTOCO.NS', 'DIVISLAB.NS', 'ONGC.NS',
    'APOLLOHOSP.NS', 'TECHM.NS', 'BPCL.NS', 'SHRIRAMFIN.NS', 'BAJAJ-AUTO.NS'
];

export default function StockDetailPage() {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS_TO_TRACK[0]);
    const [currentPage, setCurrentPage] = useState('stock');
    const [stockData, setStockData] = useState({
        symbol: "", name: "", price: 0, change: 0, changePercent: 0,
        open: 0, high: 0, low: 0, volume: 0, lastUpdated: null
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);
    const [error, setError] = useState({});
    const [tradeType, setTradeType] = useState('buy');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState('market');
    const [limitPrice, setLimitPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tradeMessage, setTradeMessage] = useState(null);
    const [timeRange, setTimeRange] = useState('1D');
    const timeRanges = ['1D', '5D', '1M', '3M', '6M', '1Y'];
    const wsRef = useRef(null);

    // --- DATA FETCHING FUNCTIONS ---
    const fetchStockInfoCardData = async (symbol) => {
        setLoading(true);
        setError(prev => ({ ...prev, stock: null }));
        try {
            const response = await fetch(`${VITE_API_URL}/market/ohlc/${symbol}`, { credentials: 'include' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                const latestData = data[data.length - 1];
                const openPrice = latestData.open || 0;
                const currentPrice = latestData.close || 0;
                const change = currentPrice - openPrice;
                const changePercent = openPrice > 0 ? (change / openPrice) * 100 : 0;

                setStockData({
                    symbol: symbol,
                    name: latestData.longName || "N/A",
                    price: currentPrice, change, changePercent,
                    open: openPrice, high: latestData.high || 0,
                    low: latestData.low || 0, volume: latestData.volume || 0,
                    lastUpdated: new Date(latestData.date),
                });
            } else {
                setStockData(prev => ({ ...prev, symbol: symbol, name: "N/A" }));
                throw new Error('No live data received for info card.');
            }
        } catch (err) {
            console.error('Error fetching stock info:', err);
            setError(prev => ({ ...prev, stock: err.message }));
        } finally {
            setLoading(false);
        }
    };

    const fetchInitial1DChartData = async (symbol) => {
        setChartLoading(true);
        setError(prev => ({ ...prev, chart: null }));
        try {
            const response = await fetch(`${VITE_API_URL}/market/ohlc/${symbol}?range=1D`, { credentials: 'include', cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const chartPoints = data.map(item => ({
                    timestamp: new Date(item.date).getTime(),
                    time: new Date(item.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(item.date).toLocaleDateString('en-IN'),
                    price: item.close,
                    volume: item.volume
                }));
                setChartData(chartPoints);
            } else {
                throw new Error("Invalid data format for 1D chart.");
            }
        } catch (err) {
            console.error('Error fetching initial 1D chart data:', err);
            setError(prev => ({ ...prev, chart: err.message }));
            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    };
    
    const fetchHistoricalDbChartData = async (symbol, range) => {
        setChartLoading(true);
        setError(prev => ({ ...prev, chart: null }));
        try {
            const response = await fetch(`${VITE_API_URL}/market/data/${symbol}?range=${range}`, { credentials: 'include', cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const chartPoints = data.map(item => ({
                    timestamp: new Date(item.date).getTime(),
                    date: new Date(item.date).toLocaleDateString('en-IN'),
                    price: item.close,
                    volume: item.volume
                }));
                setChartData(chartPoints);
            } else {
                throw new Error("Invalid data format for historical chart.");
            }
        } catch (err) {
            console.error('Error fetching historical chart data:', err);
            setError(prev => ({ ...prev, chart: err.message }));
            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    };

    // --- DATA FETCHING EFFECTS ---

    // Effect for the main info card - runs only when the symbol changes
    useEffect(() => {
        fetchStockInfoCardData(selectedSymbol);
    }, [selectedSymbol]);

    // Effect for the chart and WebSocket - runs when symbol or time range changes
    useEffect(() => {
        const setupWebSocket = () => {
            if (wsRef.current) wsRef.current.close();
            wsRef.current = new WebSocket(VITE_WS_URL);
            wsRef.current.onopen = () => {
                wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol: selectedSymbol }));
            };
            wsRef.current.onmessage = (event) => {
                const tick = JSON.parse(event.data);
                if (tick && tick.symbol === selectedSymbol) {
                    const newPoint = {
                        timestamp: tick.timestamp,
                        time: new Date(tick.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        date: new Date(tick.timestamp).toLocaleDateString('en-IN'),
                        price: tick.price,
                    };
                    setChartData(prevData => [...prevData, newPoint]);
                    setStockData(prev => ({
                        ...prev,
                        price: tick.price,
                        change: tick.price - prev.open,
                        changePercent: prev.open > 0 ? ((tick.price - prev.open) / prev.open) * 100 : 0,
                        lastUpdated: new Date(tick.timestamp)
                    }));
                }
            };
            wsRef.current.onerror = (error) => console.error('WebSocket Error:', error);
            wsRef.current.onclose = () => console.log('WebSocket disconnected');
        };

        if (timeRange === '1D') {
            fetchInitial1DChartData(selectedSymbol);
            setupWebSocket();
        } else {
            if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
            fetchHistoricalDbChartData(selectedSymbol, timeRange);
        }

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [selectedSymbol, timeRange]);


    // --- EVENT HANDLERS ---
    const handleStockChange = (event) => setSelectedSymbol(event.target.value);
    const handleTrade = async (e) => {
        e.preventDefault();
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return setTradeMessage({ type: 'error', text: 'Please enter a valid quantity' });
        }
        if (orderType === 'limit' && (!limitPrice || isNaN(limitPrice) || limitPrice <= 0)) {
            return setTradeMessage({ type: 'error', text: 'Please enter a valid limit price' });
        }
        setIsSubmitting(true);
        setTradeMessage(null);
        try {
            const tradeData = {
                symbol: selectedSymbol, quantity: parseInt(quantity),
                order_type: orderType, ...(orderType === 'limit' && { price: parseFloat(limitPrice) })
            };
            
            const response = await fetch(`${VITE_API_URL}/portfolio/${tradeType}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify(tradeData)
            });
            console.log('Trade response status:', response);
            const result = await response.json();
            if (response.ok) {
                setTradeMessage({ type: 'success', text: result.message || `${tradeType.toUpperCase()} order successful!` });
                setQuantity(''); setLimitPrice('');
            } else {
                setTradeMessage({ type: 'error', text: result.message || `Failed to submit order.` });
            }
        } catch (err) {
            setTradeMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setTradeMessage(null), 5000);
        }
    };

    // --- RENDER LOGIC ---
    const isPositive = stockData.change >= 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header currentPage={currentPage} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
                        <span className="ml-3 text-lg text-gray-500">Loading stock data...</span>
                    </div>
                </main>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="text-sm text-gray-600">{data.time ? `${data.date} ${data.time}` : data.date}</p>
                    <p className="font-semibold text-lg">₹{data.price.toFixed(2)}</p>
                    {data.volume && <p className="text-xs text-gray-500">Volume: {data.volume?.toLocaleString()}</p>}
                </div>
            );
        }
        return null;
    };
    
    const yAxisDomain = chartData.length > 0 ? [Math.min(...chartData.map(d => d.price)) * 0.99, Math.max(...chartData.map(d => d.price)) * 1.01] : [0, 100];
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* --- Stock Selector and Back Button --- */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4 sm:mb-0">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </button>
                    <div className="relative">
                        <select value={selectedSymbol} onChange={handleStockChange} className="appearance-none w-full sm:w-auto bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500">
                            {SYMBOLS_TO_TRACK.map(symbol => <option key={symbol} value={symbol}>{symbol.replace('.NS', '')}</option>)}
                        </select>
                        <ChevronDown className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* --- Main Stock Info Card --- */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold text-gray-800">{stockData.symbol.replace('.NS', '')}</h1>
                            <p className="text-lg text-gray-600 truncate max-w-sm">{stockData.name}</p>
                            {stockData.lastUpdated && <p className="text-xs text-gray-500 mt-1">Last updated: {stockData.lastUpdated.toLocaleTimeString('en-IN')}</p>}
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-4xl font-bold text-gray-800 mb-2">₹{stockData.price.toFixed(2)}</div>
                            <div className={`flex items-center justify-start md:justify-end text-lg font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                                {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Main Grid: Chart and Trading Panel --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Chart Panel --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4 sm:mb-0">Price Chart</h2>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {timeRanges.map(range => <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${timeRange === range ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{range}</button>)}
                                </div>
                            </div>
                            {chartLoading ? (
                                <div className="flex items-center justify-center h-96"><RefreshCw className="w-6 h-6 animate-spin text-gray-500" /><span className="ml-2 text-gray-500">Loading chart...</span></div>
                            ) : chartData.length > 0 ? (
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey={timeRange === '1D' ? 'time' : 'date'} stroke="#6b7280" fontSize={12} tick={{ dy: 5 }} />
                                            <YAxis stroke="#6b7280" fontSize={12} domain={yAxisDomain} tickFormatter={(tick) => `₹${tick.toFixed(0)}`} orientation="right" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="price" stroke={isPositive ? "#10b981" : "#ef4444"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" dot={false} activeDot={{ r: 5 }}/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-96 text-gray-500"><Activity className="w-6 h-6 mr-2" />No chart data available.</div>
                            )}
                        </div>
                    </div>

                    {/* --- Trading and Stats Panel --- */}
                    <div className="space-y-6">
                        {tradeMessage && <div className={`p-4 rounded-lg border ${tradeMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}><div className="flex items-center">{tradeMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}{tradeMessage.text}</div></div>}
                        
                        {/* Trade Form */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                                <button onClick={() => setTradeType('buy')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tradeType === 'buy' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Buy</button>
                                <button onClick={() => setTradeType('sell')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tradeType === 'sell' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Sell</button>
                            </div>
                            <form onSubmit={handleTrade} className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label><select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500"><option value="market">Market</option><option value="limit">Limit</option></select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="No. of shares" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500" /></div>
                                {orderType === 'limit' && <div><label className="block text-sm font-medium text-gray-700 mb-2">Limit Price</label><input type="number" step="0.01" min="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="Price per share" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500" /></div>}
                                {quantity && <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><div className="text-sm text-gray-600">Estimated Total</div><div className="text-lg font-semibold text-gray-800">₹{((orderType === 'limit' ? parseFloat(limitPrice) || 0 : stockData.price) * parseInt(quantity) || 0).toFixed(2)}</div></div>}
                                <button type="submit" disabled={isSubmitting} className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>{isSubmitting ? <div className="flex items-center justify-center"><RefreshCw className="w-4 h-4 animate-spin mr-2" />Submitting...</div> : `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} ${stockData.symbol.replace('.NS', '')}`}</button>
                            </form>
                        </div>
                        
                        {/* Market Stats */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Market Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Open</span><span className="font-semibold text-gray-800">₹{stockData.open.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Day High</span><span className="font-semibold text-gray-800">₹{stockData.high.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Day Low</span><span className="font-semibold text-gray-800">₹{stockData.low.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Volume</span><span className="font-semibold text-gray-800">{stockData.volume.toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* --- Global Error Display --- */}
                {Object.values(error).some(e => e) && (
                    <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong className="font-bold">An error occurred:</strong>
                        <ul className="mt-2 list-disc list-inside">
                            {Object.entries(error).filter(([, value]) => value).map(([key, value]) => <li key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</li>)}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}
