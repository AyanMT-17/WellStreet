import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, DollarSign, TrendingUp, Eye, TrendingDown, Activity } from 'lucide-react';
import Header from '../components/Header';

// --- IMPROVED SPARKLINE COMPONENT ---
const Sparkline = ({ data, className = "w-20 h-8", color, showLabels = false }) => {
    const memoizedGraph = useMemo(() => {
        if (!data || data.length < 2) {
            return null;
        }

        const tailwindWidth = parseInt(className.match(/w-(\d+)/)?.[1] || '20');
        const tailwindHeight = parseInt(className.match(/h-(\d+)/)?.[1] || '8');
        const width = className.includes('w-full') ? 250 : tailwindWidth * 4;
        const height = tailwindHeight * 4;

        const padding = 5;
        const labelWidth = showLabels ? 30 : 0;
        const graphWidth = width - labelWidth - padding * 2;
        const graphHeight = height - padding * 2;

        const values = data.map(d => typeof d === 'object' ? d.close : d);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const displayRange = maxValue - minValue || 1;

        const points = values.map((value, index) => {
            const x = labelWidth + padding + (index / (values.length - 1)) * graphWidth;
            const y = height - padding - ((value - minValue) / displayRange) * graphHeight;
            return { x, y };
        });

        const createSmoothPath = (points) => {
            let path = `M ${points[0].x},${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i - 1] || points[i];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = points[i + 2] || p2;

                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;

                path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
            }
            return path;
        };

        const linePath = createSmoothPath(points);
        // THEME UPDATE: Removed gradient area for cleaner brutalist look, or keep it solid
        const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

        const isPositive = values[values.length - 1] >= values[0];
        // THEME UPDATE: High contrast colors
        const strokeColor = color || (isPositive ? '#000000' : '#000000'); // Black lines for brutalism, or keep green/red?
        // Let's stick to Green/Red for semantic meaning but make them vivid
        const finalStrokeColor = color || (isPositive ? '#16a34a' : '#dc2626');

        return {
            width, height, finalWidth: className.includes('w-full') ? '100%' : width,
            linePath, areaPath, strokeColor: finalStrokeColor,
            minValue, maxValue, padding, labelWidth
        };
    }, [data, className, color, showLabels]);

    if (!memoizedGraph) {
        const tailwindHeight = parseInt(className.match(/h-(\d+)/)?.[1] || '8');
        return <div className={className} style={{ height: `${tailwindHeight * 4}px` }} />;
    }

    const {
        width, height, finalWidth, linePath, strokeColor, minValue, maxValue, padding
    } = memoizedGraph;

    return (
        <svg
            className={className}
            width={finalWidth}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
        >
            {/* THEME UPDATE: Thicker stroke for brutalist look */}
            <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {showLabels && (
                <>
                    <text
                        x={padding} y={padding}
                        fontSize="12" fill="#000" fontWeight="bold"
                        dominantBaseline="hanging"
                    >
                        {maxValue.toFixed(2)}
                    </text>
                    <text
                        x={padding} y={height - padding}
                        fontSize="12" fill="#000" fontWeight="bold"
                    >
                        {minValue.toFixed(2)}
                    </text>
                </>
            )}
        </svg>
    );
};


export default function TradingDashboard() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [profileData, setProfileData] = useState(null);
    const [portfolioData, setPortfolioData] = useState(null);
    const [watchlistData, setWatchlistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});

    const [topStocks, setTopStocks] = useState({
        'RELIANCE': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
        'TCS': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
        'HDFCBANK': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
        'TATAMOTORS': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
        'ICICIBANK': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
        'M&M': { sparklineData: [], livePrice: 0, livePriceHistory: [] },
    });

    const symbols = Object.keys(topStocks);

    async function fetchProfile() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setProfileData(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(prev => ({ ...prev, profile: err.message }));
        }
    }

    async function fetchPortfolio() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setPortfolioData(data);
        } catch (err) {
            console.error("Error fetching portfolio:", err);
            setError(prev => ({ ...prev, portfolio: err.message }));
        }
    }

    async function fetchWatchlist() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setWatchlistData(data);
        } catch (err) {
            console.error('Error fetching watchlist:', err);
            setError(prev => ({ ...prev, watchlist: err.message }));
        }
    }

    async function fetchSparklineData(symbol) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/market/ohlc/${symbol}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setTopStocks(prevState => ({
                ...prevState,
                [symbol]: { ...prevState[symbol], sparklineData: data }
            }));
        } catch (error) {
            console.error(`Failed to fetch sparkline data for ${symbol}`, error);
            setError(prev => ({ ...prev, [`sparkline_${symbol}`]: `Failed for ${symbol}` }));
        }
    }

    // WebSocket connection
    useEffect(() => {
        const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}`);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            ws.send(JSON.stringify({
                action: 'subscribe',
                symbols: symbols
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'price-update' && data.ticks) {
                    for (const tick of data.ticks) {
                        const symbol = tick.symbol.replace('.NS', '');

                        setTopStocks(prevState => {
                            if (!prevState[symbol]) return prevState;

                            const newHistory = [...prevState[symbol].livePriceHistory, tick.price];

                            if (newHistory.length > 50) {
                                newHistory.shift();
                            }

                            return {
                                ...prevState,
                                [symbol]: {
                                    ...prevState[symbol],
                                    livePrice: tick.price || 0,
                                    livePriceHistory: newHistory
                                }
                            };
                        });
                    }
                }
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError(prev => ({ ...prev, websocket: 'Failed to connect to live data feed' }));
        };

        return () => ws.close();
    }, []);

    // Load all data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchProfile(),
                fetchPortfolio(),
                fetchWatchlist(),
                ...symbols.map(symbol => fetchSparklineData(symbol))
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        // THEME UPDATE: Brutalist Loader
        return (
            <div className="min-h-screen bg-yellow-400 flex flex-col">
                <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <main className="flex-grow flex items-center justify-center">
                    <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000]">
                        <div className="text-2xl font-black uppercase animate-pulse">Loading Data...</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        // THEME UPDATE: Main background color from index.css logic or forced here
        <div className="min-h-screen bg-[#f3f4f6]">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Page Title */}
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-1">
                        Trading Dashboard
                    </h1>
                    <p className="text-lg font-bold text-gray-700">Overview of your market performance</p>
                </div>

                {/* Profile Section */}
                <div className="bg-white border-3 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex items-center mb-6 pb-2 border-b-3 border-black">
                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center mr-4 border-2 border-black">
                            <User className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black uppercase">Profile Information</h2>
                    </div>
                    {profileData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(profileData).map(([key, value]) => (
                                <div key={key} className="bg-yellow-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                    <div className="text-xs font-bold uppercase text-gray-600 mb-1">
                                        {key.replace('_', ' ')}
                                    </div>
                                    <div className="text-xl font-black text-black">{String(value)}</div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="font-bold text-red-600 border-2 border-red-600 p-4 bg-red-100">Failed to load profile data</div>}
                </div>

                {/* Market Highlights Section */}
                <div>
                    <h2 className="text-2xl font-black uppercase mb-6 inline-block bg-black text-white px-2 py-1 transform -rotate-1">
                        Market Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(topStocks).map(([symbol, data]) => {
                            const hasSparklineData = data.sparklineData && data.sparklineData.length > 0;
                            const startPrice = hasSparklineData ? data.sparklineData[0].close : 0;
                            const priceChange = data.livePrice - startPrice;
                            const priceChangePercent = startPrice !== 0 ? (priceChange / startPrice) * 100 : 0;
                            const isPositive = priceChange >= 0;

                            return (
                                <div key={symbol} className="bg-white border-3 border-black p-5 shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-xl font-black uppercase tracking-tight">{symbol}</div>
                                            <div className="text-2xl font-bold mt-1">
                                                ₹{data.livePrice > 0 ? data.livePrice.toFixed(2) : '...'}
                                            </div>
                                            {hasSparklineData && data.livePrice > 0 && (
                                                <div className={`text-sm font-bold mt-1 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                                                    <div className="flex items-center">
                                                        {isPositive ? <TrendingUp className="w-4 h-4 mr-1 stroke-[3]" /> : <TrendingDown className="w-4 h-4 mr-1 stroke-[3]" />}
                                                        {isPositive ? '+' : ''}₹{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-2 border-black p-1 bg-gray-50">
                                            {hasSparklineData ? (
                                                <Sparkline data={data.sparklineData} className="w-20 h-10" />
                                            ) : (
                                                <div className="w-20 h-10 flex items-center justify-center">
                                                    <Activity className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t-3 border-black">
                                        {data.livePriceHistory.length > 1 ? (
                                            <Sparkline data={data.livePriceHistory} className="w-full h-24" showLabels={true} />
                                        ) : (
                                            <div className="w-full h-24 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                                                Waiting for live data...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="bg-white border-3 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex items-center mb-6 pb-2 border-b-3 border-black">
                        <div className="w-12 h-12 bg-green-400 text-black border-2 border-black flex items-center justify-center mr-4">
                            <DollarSign className="w-6 h-6 stroke-[3]" />
                        </div>
                        <h2 className="text-2xl font-black uppercase">Portfolio Overview</h2>
                    </div>
                    {portfolioData ? (
                        <div className="space-y-6">
                            {portfolioData.cash && (
                                <div className="bg-green-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex justify-between items-center">
                                    <div className="text-sm font-bold uppercase text-gray-700">Available Cash</div>
                                    <div className="text-3xl font-black text-black">₹{portfolioData.cash}</div>
                                </div>
                            )}
                            {portfolioData.positions && portfolioData.positions.length > 0 ? (
                                <div>
                                    <h3 className="text-lg font-bold uppercase mb-3 border-l-4 border-black pl-2">Current Positions</h3>
                                    <div className="grid gap-4">
                                        {portfolioData.positions.map((position, index) => (
                                            <div key={index} className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000]">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {Object.entries(position).map(([key, value]) => (
                                                        <div key={key}>
                                                            <div className="text-xs font-bold uppercase text-gray-500">
                                                                {key.replace('_', ' ')}
                                                            </div>
                                                            <div className="text-sm font-bold text-black">{String(value)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 border-2 border-dashed border-black p-6 text-center text-gray-600 font-bold">
                                    NO POSITIONS FOUND
                                </div>
                            )}
                        </div>
                    ) : <div className="text-red-600 font-bold">Failed to load portfolio data</div>}
                </div>

                {/* Watchlist Section */}
                <div className="bg-white border-3 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex items-center mb-6 pb-2 border-b-3 border-black">
                        <div className="w-12 h-12 bg-blue-300 text-black border-2 border-black flex items-center justify-center mr-4">
                            <Eye className="w-6 h-6 stroke-[3]" />
                        </div>
                        <h2 className="text-2xl font-black uppercase">Watchlist</h2>
                    </div>
                    {watchlistData ? (
                        <div>
                            {Array.isArray(watchlistData) && watchlistData.length > 0 ? (
                                <div className="grid gap-4">
                                    {watchlistData.map((item, index) => (
                                        <div key={index} className="bg-blue-50 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000] hover:bg-blue-100 transition-colors">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {Object.entries(item).map(([key, value]) => (
                                                    <div key={key}>
                                                        <div className="text-xs font-bold uppercase text-gray-500">
                                                            {key.replace('_', ' ')}
                                                        </div>
                                                        <div className="text-sm font-bold text-black">{String(value)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-100 border-2 border-dashed border-black p-6 text-center text-gray-600 font-bold">
                                    NO WATCHLIST ITEMS FOUND
                                </div>
                            )}
                        </div>
                    ) : <div className="text-red-600 font-bold">Failed to load watchlist data</div>}
                </div>

                {/* Error Display */}
                {Object.keys(error).length > 0 && (
                    <div className="mt-8 bg-red-100 border-2 border-red-500 text-red-900 px-4 py-3 shadow-[4px_4px_0px_0px_#ef4444]">
                        <strong className="font-black uppercase block mb-1">Errors occurred:</strong>
                        <ul className="list-disc list-inside font-medium text-sm">
                            {Object.entries(error).map(([key, value]) => (
                                <li key={key}><span className="font-bold underline">{key}:</span> {value}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}