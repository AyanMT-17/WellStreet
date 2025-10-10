import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, DollarSign, TrendingUp, Eye, TrendingDown, Activity } from 'lucide-react';
import Header from '../components/Header';

// --- IMPROVED SPARKLINE COMPONENT ---
// This component has been refactored for a more modern look and better performance.
const Sparkline = ({ data, className = "w-20 h-8", color, showLabels = false }) => {
    // useMemo will prevent expensive recalculations on every render.
    const memoizedGraph = useMemo(() => {
        if (!data || data.length < 2) {
            return null;
        }

        // --- Sizing and Data Preparation ---
        // Parse width and height from Tailwind classes.
        const tailwindWidth = parseInt(className.match(/w-(\d+)/)?.[1] || '20');
        const tailwindHeight = parseInt(className.match(/h-(\d+)/)?.[1] || '8');
        const width = className.includes('w-full') ? 250 : tailwindWidth * 4; // Use a fixed width for w-full for viewBox consistency
        const height = tailwindHeight * 4;

        const padding = 5;
        const labelWidth = showLabels ? 30 : 0;
        const graphWidth = width - labelWidth - padding * 2;
        const graphHeight = height - padding * 2;

        const values = data.map(d => typeof d === 'object' ? d.close : d);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const displayRange = maxValue - minValue || 1;

        // Map data points to SVG coordinates.
        const points = values.map((value, index) => {
            const x = labelWidth + padding + (index / (values.length - 1)) * graphWidth;
            const y = height - padding - ((value - minValue) / displayRange) * graphHeight;
            return { x, y };
        });

        // --- SVG Path Generation for a Smooth Curve ---
        // This function creates the 'd' attribute for an SVG path, drawing a smooth curve.
        const createSmoothPath = (points) => {
            let path = `M ${points[0].x},${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i - 1] || points[i];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = points[i + 2] || p2;
                
                // Using Catmull-Rom to Cubic Bezier conversion for smooth curves
                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;

                path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
            }
            return path;
        };

        const linePath = createSmoothPath(points);
        const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

        // --- Dynamic Styling ---
        const isPositive = values[values.length - 1] >= values[0];
        const strokeColor = color || (isPositive ? '#10b981' : '#ef4444');
        const gradientId = `sparkline-gradient-${isPositive ? 'green' : 'red'}`;
        const gradientColor = isPositive ? '16, 185, 129' : '239, 68, 68';

        return {
            width, height, finalWidth: className.includes('w-full') ? '100%' : width,
            linePath, areaPath, strokeColor, gradientId, gradientColor,
            minValue, maxValue, padding, labelWidth
        };
    }, [data, className, color, showLabels]);

    if (!memoizedGraph) {
        // Return a placeholder if no data is available
        const tailwindHeight = parseInt(className.match(/h-(\d+)/)?.[1] || '8');
        return <div className={className} style={{ height: `${tailwindHeight * 4}px` }} />;
    }

    const {
        width, height, finalWidth, linePath, areaPath, strokeColor,
        gradientId, gradientColor, minValue, maxValue, padding
    } = memoizedGraph;

    return (
        <svg
            className={className}
            width={finalWidth}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={`rgba(${gradientColor}, 0.2)`} />
                    <stop offset="100%" stopColor={`rgba(${gradientColor}, 0)`} />
                </linearGradient>
            </defs>
            
            {/* Gradient fill area */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* The smooth line */}
            <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Min/Max labels */}
            {showLabels && (
                <>
                    <text
                        x={padding} y={padding}
                        fontSize="11" fill="#6b7280"
                        dominantBaseline="hanging"
                    >
                        {maxValue.toFixed(2)}
                    </text>
                    <text
                        x={padding} y={height - padding}
                        fontSize="11" fill="#6b7280"
                    >
                        {minValue.toFixed(2)}
                    </text>
                </>
            )}
        </svg>
    );
};


// --- The TradingDashboard component remains the same below ---
// Only a single line was changed to allow the live graph to be colored dynamically.

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
        'M&M' : { sparklineData: [], livePrice: 0, livePriceHistory: [] },
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
        return (
            <div className="min-h-screen bg-gray-50">
                <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-gray-500">Loading dashboard data...</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Trading Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2">Your profile, portfolio, and watchlist overview</p>
                </div>

                <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-700">
                            Profile Information
                        </h2>
                    </div>
                    {profileData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(profileData).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm font-medium text-gray-500 capitalize">
                                        {key.replace('_', ' ')}
                                    </div>
                                    <div className="text-gray-800 font-semibold">{String(value)}</div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-red-600">Failed to load profile data</div>}
                </div>

                {/* Market Highlights Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
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
                                <div key={symbol} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-gray-800 text-lg">{symbol}</div>
                                                <div className="text-xl font-semibold text-gray-800">
                                                    ₹{data.livePrice > 0 ? data.livePrice.toFixed(2) : '...'}
                                                </div>
                                                {hasSparklineData && data.livePrice > 0 && (
                                                    <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                        <div className="flex items-center">
                                                            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                                            {isPositive ? '+' : ''}₹{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {hasSparklineData ? (
                                                    <Sparkline data={data.sparklineData} className="w-20 h-8" />
                                                ) : (
                                                    <div className="w-20 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                        <Activity className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        {data.livePriceHistory.length > 1 ? (
                                             // CHANGE: Removed the hardcoded gray color to allow dynamic coloring.
                                            <Sparkline data={data.livePriceHistory} className="w-full h-24" showLabels={true} />
                                        ) : (
                                            <div className="w-full h-24 bg-gray-50 rounded flex items-center justify-center text-xs text-gray-400">
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
                <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <DollarSign className="w-5 h-5 text-gray-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-700">Portfolio Overview</h2>
                    </div>
                    {portfolioData ? (
                        <div className="space-y-4">
                            {portfolioData.cash && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="text-sm font-medium text-gray-500">Available Cash</div>
                                    <div className="text-2xl font-bold text-gray-800">₹{portfolioData.cash}</div>
                                </div>
                            )}
                            {portfolioData.positions && portfolioData.positions.length > 0 ? (
                                <div>
                                    <h3 className="text-md font-semibold text-gray-800 mb-3">Current Positions</h3>
                                    <div className="grid gap-3">
                                        {portfolioData.positions.map((position, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {Object.entries(position).map(([key, value]) => (
                                                        <div key={key}>
                                                            <div className="text-xs font-medium text-gray-500 capitalize">
                                                                {key.replace('_', ' ')}
                                                            </div>
                                                            <div className="text-sm font-semibold text-gray-800">{String(value)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                                    No positions found
                                </div>
                            )}
                        </div>
                    ) : <div className="text-red-600">Failed to load portfolio data</div>}
                </div>

                {/* Watchlist Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <Eye className="w-5 h-5 text-gray-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-700">Watchlist</h2>
                    </div>
                    {watchlistData ? (
                        <div>
                            {Array.isArray(watchlistData) && watchlistData.length > 0 ? (
                                <div className="grid gap-3">
                                    {watchlistData.map((item, index) => (
                                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {Object.entries(item).map(([key, value]) => (
                                                    <div key={key}>
                                                        <div className="text-xs font-medium text-gray-500 capitalize">
                                                            {key.replace('_', ' ')}
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-800">{String(value)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                                    No watchlist items found
                                </div>
                            )}
                        </div>
                    ) : <div className="text-red-600">Failed to load watchlist data</div>}
                </div>

                {/* Error Display */}
                {Object.keys(error).length > 0 && (
                    <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong className="font-bold">Errors occurred:</strong>
                        <ul className="mt-2 list-disc list-inside">
                            {Object.entries(error).map(([key, value]) => (
                                <li key={key}><strong>{key}:</strong> {value}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}