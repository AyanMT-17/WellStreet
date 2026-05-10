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
            <div className="min-h-screen bg-[#fccc07]">
                <Header currentPage={currentPage} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center justify-center h-64 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
                        <RefreshCw className="w-12 h-12 animate-spin text-black mb-4" />
                        <span className="text-xl font-black text-black uppercase tracking-widest">Loading stock data...</span>
                    </div>
                </main>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">{data.time ? `${data.date} ${data.time}` : data.date}</p>
                    <p className="font-black text-xl text-black">₹{data.price.toFixed(2)}</p>
                    {data.volume && <p className="text-xs font-bold text-gray-500">Vol: {data.volume?.toLocaleString()}</p>}
                </div>
            );
        }
        return null;
    };

    const yAxisDomain = chartData.length > 0 ? [Math.min(...chartData.map(d => d.price)) * 0.99, Math.max(...chartData.map(d => d.price)) * 1.01] : [0, 100];

    return (
        <div className="min-h-screen bg-[#fccc07]">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* --- Stock Selector and Back Button --- */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <button onClick={() => navigate(-1)} className="flex items-center text-black font-bold uppercase tracking-wide hover:bg-white hover:border-2 hover:border-black px-2 py-1 transition-all">
                        <ArrowLeft className="w-5 h-5 mr-2 stroke-[3]" /> Back to Dashboard
                    </button>
                    <div className="relative">
                        <select value={selectedSymbol} onChange={handleStockChange} className="appearance-none w-full sm:w-auto bg-white border-3 border-black py-3 pl-4 pr-12 text-black font-black uppercase text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all">
                            {SYMBOLS_TO_TRACK.map(symbol => <option key={symbol} value={symbol}>{symbol.replace('.NS', '')}</option>)}
                        </select>
                        <ChevronDown className="w-5 h-5 text-black absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none stroke-[3]" />
                    </div>
                </div>

                {/* --- Main Stock Info Card --- */}
                <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] mb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-6 md:mb-0">
                            <h1 className="text-4xl font-black text-black uppercase tracking-wider mb-2">{stockData.symbol.replace('.NS', '')}</h1>
                            <p className="text-lg font-bold text-gray-600 truncate max-w-sm uppercase">{stockData.name}</p>
                            {stockData.lastUpdated && <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wide bg-gray-100 inline-block px-2">Last updated: {stockData.lastUpdated.toLocaleTimeString('en-IN')}</p>}
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-5xl font-black text-black mb-2">₹{stockData.price.toFixed(2)}</div>
                            <div className={`flex items-center justify-start md:justify-end text-xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? <TrendingUp className="w-6 h-6 mr-2 stroke-[3]" /> : <TrendingDown className="w-6 h-6 mr-2 stroke-[3]" />}
                                {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Main Grid: Chart and Trading Panel --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Chart Panel --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b-2 border-black pb-4">
                                <h2 className="text-xl font-black text-black uppercase tracking-wide mb-4 sm:mb-0">Price Chart</h2>
                                <div className="flex bg-black p-1 border-2 border-black">
                                    {timeRanges.map(range => <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 text-xs font-black transition-colors uppercase ${timeRange === range ? 'bg-white text-black' : 'text-white hover:text-gray-300'}`}>{range}</button>)}
                                </div>
                            </div>
                            {chartLoading ? (
                                <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 animate-spin text-black" /><span className="ml-3 font-bold text-black uppercase">Loading chart...</span></div>
                            ) : chartData.length > 0 ? (
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={isPositive ? "#16a34a" : "#dc2626"} stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor={isPositive ? "#16a34a" : "#dc2626"} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey={timeRange === '1D' ? 'time' : 'date'} stroke="#000" fontSize={10} tick={{ dy: 5 }} tickLine={false} axisLine={{ strokeWidth: 2 }} />
                                            <YAxis stroke="#000" fontSize={10} domain={yAxisDomain} tickFormatter={(tick) => `₹${tick.toFixed(0)}`} orientation="right" tickLine={false} axisLine={{ strokeWidth: 2 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="price" stroke={isPositive ? "#16a34a" : "#dc2626"} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" dot={false} activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-96 text-gray-500 font-bold uppercase"><Activity className="w-6 h-6 mr-2" />No chart data available.</div>
                            )}
                        </div>
                    </div>

                    {/* --- Trading and Stats Panel --- */}
                    <div className="space-y-8">
                        {tradeMessage && <div className={`p-4 border-4 font-bold flex items-center shadow-[4px_4px_0px_0px_#000] uppercase ${tradeMessage.type === 'success' ? 'bg-[#a3e635] border-black text-black' : 'bg-[#f87171] border-black text-black'}`}><div className="flex items-center">{tradeMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 stroke-[3]" /> : <AlertCircle className="w-5 h-5 mr-2 stroke-[3]" />}{tradeMessage.text}</div></div>}

                        {/* Trade Form */}
                        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                            <div className="flex bg-white border-2 border-black p-1 mb-6 shadow-[2px_2px_0px_0px_#000]">
                                <button onClick={() => setTradeType('buy')} className={`flex-1 py-2 px-4 text-sm font-black uppercase transition-all ${tradeType === 'buy' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-black'}`}>Buy</button>
                                <button onClick={() => setTradeType('sell')} className={`flex-1 py-2 px-4 text-sm font-black uppercase transition-all ${tradeType === 'sell' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-black'}`}>Sell</button>
                            </div>
                            <form onSubmit={handleTrade} className="space-y-5">
                                <div><label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Order Type</label><select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full px-3 py-3 border-3 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all"><option value="market">Market</option><option value="limit">Limit</option></select></div>
                                <div><label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Quantity</label><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="No. of shares" className="w-full px-3 py-3 border-3 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all" /></div>
                                {orderType === 'limit' && <div><label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Limit Price</label><input type="number" step="0.01" min="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="Price per share" className="w-full px-3 py-3 border-3 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all" /></div>}
                                {quantity && <div className="bg-yellow-50 p-4 border-2 border-dashed border-black"><div className="text-xs font-bold text-gray-500 uppercase">Estimated Total</div><div className="text-xl font-black text-black">₹{((orderType === 'limit' ? parseFloat(limitPrice) || 0 : stockData.price) * parseInt(quantity) || 0).toFixed(2)}</div></div>}
                                <button type="submit" disabled={isSubmitting} className={`w-full py-4 px-4 border-3 border-black font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${tradeType === 'buy' ? 'bg-green-600' : 'bg-red-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>{isSubmitting ? <div className="flex items-center justify-center"><RefreshCw className="w-4 h-4 animate-spin mr-2" />Submitting...</div> : `${tradeType} ${stockData.symbol.replace('.NS', '')}`}</button>
                            </form>
                        </div>

                        {/* Market Stats */}
                        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                            <h3 className="text-lg font-black text-black uppercase tracking-wide mb-4 border-b-2 border-black pb-2">Market Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm"><span className="text-gray-600 font-bold uppercase">Open</span><span className="font-black text-black">₹{stockData.open.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600 font-bold uppercase">Day High</span><span className="font-black text-black">₹{stockData.high.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600 font-bold uppercase">Day Low</span><span className="font-black text-black">₹{stockData.low.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600 font-bold uppercase">Volume</span><span className="font-black text-black">{stockData.volume.toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Global Error Display --- */}
                {Object.values(error).some(e => e) && (
                    <div className="mt-8 bg-red-100 border-4 border-black shadow-[4px_4px_0px_0px_#000] text-red-900 px-6 py-4">
                        <strong className="font-black uppercase text-lg">An error occurred:</strong>
                        <ul className="mt-2 list-disc list-inside font-medium">
                            {Object.entries(error).filter(([, value]) => value).map(([key, value]) => <li key={key}><strong className="uppercase">{key}:</strong> {value}</li>)}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}
