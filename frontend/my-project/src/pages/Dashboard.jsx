import React, { useState, useEffect, useRef } from 'react';
import { User, DollarSign, TrendingUp, Eye, TrendingDown, Activity } from 'lucide-react';
import Header from '../components/Header';

// UPDATED Sparkline component to handle bigger range and size
const Sparkline = ({ data, className = "w-20 h-8", color, showLabels = false }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        
        svg.innerHTML = ''; // Clear previous content

        if (!data || data.length < 2) {
            return;
        }

        const width = parseInt(svg.getAttribute('width'));
        const height = parseInt(svg.getAttribute('height'));
        const padding = 2;
        const labelWidth = showLabels ? 40 : 0; // Space for labels

        const values = data.map(d => typeof d === 'object' ? d.close : d);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        // NEW: Add padding to the Y-axis range for better visualization
        const rangePadding = (maxValue - minValue) * 0.1; // 10% padding
        const paddedMax = maxValue + rangePadding;
        const paddedMin = minValue - rangePadding;
        const displayRange = paddedMax - paddedMin || 1;

        // Draw the line graph using the new padded range
        const points = values.map((value, index) => {
            const x = (index / (values.length - 1)) * (width - 2 * padding - labelWidth) + padding + labelWidth;
            const y = height - padding - ((value - paddedMin) / displayRange) * (height - 2 * padding);
            return `${x},${y}`;
        }).join(' ');

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', points);
        polyline.setAttribute('fill', 'none');
        
        const strokeColor = color || (values[values.length - 1] > values[0] ? '#10b981' : '#ef4444');
        polyline.setAttribute('stroke', strokeColor);
        polyline.setAttribute('stroke-width', '1.5');
        svg.appendChild(polyline);

        // Add labels if enabled (labels still show actual min/max)
        if (showLabels) {
            const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            maxLabel.setAttribute('x', padding);
            maxLabel.setAttribute('y', padding + 4);
            maxLabel.setAttribute('fill', '#6b7280');
            maxLabel.setAttribute('font-size', '11');
            maxLabel.setAttribute('dominant-baseline', 'hanging');
            maxLabel.textContent = maxValue.toFixed(2);
            svg.appendChild(maxLabel);
            
            const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            minLabel.setAttribute('x', padding);
            minLabel.setAttribute('y', height - padding - 4);
            minLabel.setAttribute('fill', '#6b7280');
            minLabel.setAttribute('font-size', '11');
            minLabel.setAttribute('dominant-baseline', 'auto');
            minLabel.textContent = minValue.toFixed(2);
            svg.appendChild(minLabel);
        }
    }, [data, className, color, showLabels]);

    const [width, height] = [
        parseInt(className.match(/w-(\d+|full)/)?.[1] || '20') * 4 || 80,
        parseInt(className.match(/h-(\d+)/)?.[1] || '8') * 4 || 32,
    ];
    
    const finalWidth = className.includes('w-full') ? '100%' : width;

    return (
        <svg
            ref={svgRef}
            className={className}
            width={finalWidth}
            height={height}
            viewBox={`0 0 ${className.includes('w-full') ? 250 : width} ${height}`}
        />
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
            <div className="min-h-screen bg-yellow-200">
                <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-amber-700">Loading dashboard data...</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-yellow-200">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
                        Trading Dashboard
                    </h1>
                    <p className="text-amber-700 mt-2">Your profile, portfolio, and watchlist overview</p>
                </div>

                {/* Profile Section */}
                <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center mr-3 shadow-md">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
                            Profile Information
                        </h2>
                    </div>
                    {profileData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(profileData).map(([key, value]) => (
                                <div key={key} className="bg-amber-50 rounded-lg p-3">
                                    <div className="text-sm font-medium text-amber-800 capitalize">
                                        {key.replace('_', ' ')}
                                    </div>
                                    <div className="text-amber-900 font-semibold">{String(value)}</div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-red-600">Failed to load profile data</div>}
                </div>

                {/* Market Highlights Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent mb-4">
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
                                <div key={symbol} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-amber-900 text-lg">{symbol}</div>
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

                                    <div className="mt-4 pt-4 border-t border-amber-100">
                                        {data.livePriceHistory.length > 1 ? (
                                            // UPDATED: Increased height from h-16 to h-24
                                            <Sparkline data={data.livePriceHistory} className="w-full h-24" color="#ffc107" showLabels={true} />
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
                <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-md">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-green-700">Portfolio Overview</h2>
                    </div>
                    {portfolioData ? (
                        <div className="space-y-4">
                            {portfolioData.cash && (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="text-sm font-medium text-green-800">Available Cash</div>
                                    <div className="text-2xl font-bold text-green-900">₹{portfolioData.cash}</div>
                                </div>
                            )}
                            {portfolioData.positions && portfolioData.positions.length > 0 ? (
                                <div>
                                    <h3 className="text-md font-semibold text-gray-800 mb-3">Current Positions</h3>
                                    <div className="grid gap-3">
                                        {portfolioData.positions.map((position, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {Object.entries(position).map(([key, value]) => (
                                                        <div key={key}>
                                                            <div className="text-xs font-medium text-gray-600 capitalize">
                                                                {key.replace('_', ' ')}
                                                            </div>
                                                            <div className="text-sm font-semibold text-gray-900">{String(value)}</div>
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
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                     <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-md">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-blue-700">Watchlist</h2>
                    </div>
                    {watchlistData ? (
                        <div>
                            {Array.isArray(watchlistData) && watchlistData.length > 0 ? (
                                <div className="grid gap-3">
                                    {watchlistData.map((item, index) => (
                                        <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {Object.entries(item).map(([key, value]) => (
                                                    <div key={key}>
                                                        <div className="text-xs font-medium text-blue-600 capitalize">
                                                            {key.replace('_', ' ')}
                                                        </div>
                                                        <div className="text-sm font-semibold text-blue-900">{String(value)}</div>
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