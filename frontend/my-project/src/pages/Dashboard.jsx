import React, { useState, useEffect, useMemo } from 'react';
import { User, DollarSign, TrendingUp, Eye, TrendingDown, Activity, Globe, Search } from 'lucide-react';
import { readCache, writeCache } from '../utils/cache';
import { useAppSession } from '../context/appSession';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getDisplayName } from '../utils/tickerMappings';

const MACRO_INDICES = {
    'SPY': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'QQQ': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
};

const TOP_STOCKS = {
    'AAPL': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'NVDA': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'TSLA': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'MSFT': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'AMZN': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'META': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'GOOGL': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'BRK-B': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    'AVGO': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
};

const ALL_WATCH_SYMBOLS = [...Object.keys(MACRO_INDICES), ...Object.keys(TOP_STOCKS)];
const DASHBOARD_STOCKS_CACHE = readCache('dashboard-top-stocks', 2 * 60 * 1000);

const Sparkline = ({ data, className = "w-20 h-8", color }) => {
    const memoizedGraph = useMemo(() => {
        if (!data || data.length < 2) return null;
        const values = data.map(d => typeof d === 'object' ? d.close : d);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        
        const points = values.map((v, i) => ({
            x: (i / (values.length - 1)) * 100,
            y: 100 - ((v - min) / range) * 100
        }));

        const path = `M ${points[0].x},${points[0].y} ` + 
            points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');

        const isPositive = values[values.length - 1] >= values[0];
        return { path, color: color || (isPositive ? '#16a34a' : '#dc2626') };
    }, [data, color]);

    if (!memoizedGraph) return <div className={className} />;

    return (
        <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={memoizedGraph.path} fill="none" stroke={memoizedGraph.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default function TradingDashboard() {
    const { user, watchlist, dataLoading } = useAppSession();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!DASHBOARD_STOCKS_CACHE);
    const [error, setError] = useState({});
    const [topStocks, setTopStocks] = useState(DASHBOARD_STOCKS_CACHE || { ...MACRO_INDICES, ...TOP_STOCKS });
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/Stockpage?symbol=${searchQuery.trim().toUpperCase()}`);
        }
    };

    async function fetchSparklineData(symbol) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/market/ohlc/${symbol}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setTopStocks(prevState => {
                const nextState = {
                    ...prevState,
                    [symbol]: { ...prevState[symbol], sparklineData: data }
                };
                writeCache('dashboard-top-stocks', nextState);
                return nextState;
            });
        } catch (fetchError) {
            console.error(`Failed to fetch sparkline for ${symbol}`, fetchError);
        }
    }

    useEffect(() => {
        const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}`);
        ws.onopen = () => ws.send(JSON.stringify({ action: 'subscribe', symbols: ALL_WATCH_SYMBOLS }));
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'price-update' && data.ticks) {
                    setTopStocks(prevState => {
                        const nextState = { ...prevState };
                        data.ticks.forEach(tick => {
                            const symbol = tick.symbol;
                            if (nextState[symbol]) {
                                const newHistory = [...(nextState[symbol].livePriceHistory || []), tick.price].slice(-50);
                                nextState[symbol] = { ...nextState[symbol], livePrice: tick.price, livePriceHistory: newHistory };
                            }
                        });
                        return nextState;
                    });
                }
            } catch (wsError) {}
        };
        return () => ws.close();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all(ALL_WATCH_SYMBOLS.map(symbol => fetchSparklineData(symbol)));
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading || (dataLoading.watchlist && !user)) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-400 font-medium animate-pulse uppercase tracking-widest">Initialising Terminal...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                {/* Search & Welcome */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Market Command</h1>
                        <p className="text-stone-500 font-medium">Professional US Equity Intelligence</p>
                    </div>
                    <form onSubmit={handleSearch} className="relative group max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search Ticker (e.g. NVDA, MSFT)"
                            className="w-full bg-white border border-stone-200 pl-10 pr-4 py-2.5 outline-none focus:border-stone-900 transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Macro Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(topStocks).map(([symbol, data]) => {
                        const hasSparkline = data.sparklineData && data.sparklineData.length > 0;
                        const startPrice = hasSparkline ? data.sparklineData[0].close : 0;
                        const priceChange = data.livePrice - startPrice;
                        const priceChangePercent = startPrice !== 0 ? (priceChange / startPrice) * 100 : 0;
                        const isPositive = priceChange >= 0;

                        return (
                            <div key={symbol} 
                                onClick={() => navigate(`/Stockpage?symbol=${symbol}`)}
                                className="bg-white border border-stone-200 p-5 shadow-sm hover:border-stone-400 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{symbol === 'SPY' || symbol === 'QQQ' ? 'Index Proxy' : 'Equity'}</span>
                                            {isPositive ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
                                        </div>
                                        <div className="text-xl font-bold text-stone-900 mt-0.5">{getDisplayName(symbol)}</div>
                                        <div className="text-2xl font-bold mt-2">
                                            ${data.livePrice > 0 ? data.livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '...'}
                                        </div>
                                        {data.livePrice > 0 && (
                                            <div className={`text-sm font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-12 w-24">
                                        <Sparkline data={data.sparklineData} className="w-full h-full" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Watchlist Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                            <Eye className="w-5 h-5 text-stone-900" />
                            <h2 className="text-lg font-bold uppercase tracking-widest text-stone-900">Tracked Assets</h2>
                        </div>
                        {watchlist && watchlist.length > 0 ? (
                            <div className="grid gap-4">
                                {watchlist.map((item, index) => (
                                    <div key={index} 
                                        onClick={() => navigate(`/Stockpage?symbol=${item.symbol}`)}
                                        className="bg-white border border-stone-200 p-4 shadow-sm flex justify-between items-center hover:bg-stone-50 transition-colors cursor-pointer group">
                                        <div>
                                            <div className="font-bold text-stone-900">{getDisplayName(item.symbol)}</div>
                                            <div className="text-xs text-stone-400 font-medium uppercase tracking-tighter">US Exchange</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-stone-900">${item.openPrice?.toFixed(2)}</div>
                                            <div className="text-[10px] font-bold text-stone-400 uppercase">Opening Reference</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-stone-300 p-10 text-center">
                                <p className="text-stone-400 font-medium uppercase text-xs tracking-widest">No assets tracked. Search to add.</p>
                            </div>
                        )}
                    </div>

                    {/* Global News Summary (Placeholder for now) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                            <Globe className="w-5 h-5 text-stone-900" />
                            <h2 className="text-lg font-bold uppercase tracking-widest text-stone-900">Global Intel</h2>
                        </div>
                        <div className="bg-stone-900 text-stone-50 p-6 space-y-4 shadow-xl">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">AI Market Pulse</div>
                            <p className="text-sm font-medium leading-relaxed">
                                US Markets are showing strong resilience ahead of the upcoming CPI data. Tech leads the charge with AI-focused equities seeing continued institutional inflow.
                            </p>
                            <div className="pt-4 border-t border-stone-700">
                                <div className="text-[10px] font-bold text-stone-500 uppercase">Analysis Engine: Groq Llama 3.3</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
