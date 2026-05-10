import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Info, ArrowLeft, Plus, Check, Loader2, Sparkles, 
  BarChart3, Activity, ShieldAlert, Target, Zap
} from 'lucide-react';
import { useAppSession } from '../context/appSession';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart
} from 'recharts';

import { getDisplayName } from '../utils/tickerMappings';

export default function StockDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const symbol = searchParams.get('symbol')?.toUpperCase() || 'AAPL';
  const { watchlist, updateWatchlist } = useAppSession();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [ohlcData, setOhlcData] = useState([]);
  const [technicals, setTechnicals] = useState(null);
  const [institutional, setInstitutional] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [range, setRange] = useState('1M');

  const isWatchlisted = watchlist?.some(item => item.symbol === symbol);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, ohlcRes, techRes, instRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/market/summary/${symbol}`, { credentials: 'include' }),
        fetch(`${import.meta.env.VITE_API_URL}/market/ohlc/${symbol}?range=${range}`, { credentials: 'include' }),
        fetch(`${import.meta.env.VITE_API_URL}/market/technicals/${symbol}`, { credentials: 'include' }),
        fetch(`${import.meta.env.VITE_API_URL}/market/institutional/${symbol}`, { credentials: 'include' })
      ]);
      
      if (summaryRes.ok) setData(await summaryRes.json());
      if (ohlcRes.ok) setOhlcData(await ohlcRes.json());
      if (techRes.ok) setTechnicals(await techRes.json());
      if (instRes.ok) setInstitutional(await instRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/market/analysis/${symbol}`, { credentials: 'include' });
      if (res.ok) setAnalysis(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAnalysis();
  }, [symbol, range]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const news = data?.news || [];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-200 transition-colors border border-stone-200 bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-stone-900">{getDisplayName(symbol)}</h1>
                <span className="px-2 py-0.5 bg-stone-200 text-stone-600 text-[10px] font-bold uppercase tracking-wider">US Market</span>
              </div>
              <p className="text-stone-500 font-medium">{summary.longName || 'Intelligence Syncing...'}</p>
            </div>
          </div>
          
          <button 
            onClick={() => updateWatchlist(symbol, isWatchlisted ? 'remove' : 'add')}
            className={`inline-flex items-center gap-2 px-6 py-2.5 font-bold uppercase text-xs tracking-widest transition-all ${
              isWatchlisted ? 'bg-white border border-stone-200 text-stone-400' : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
            }`}
          >
            {isWatchlisted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isWatchlisted ? 'Tracked' : 'Track Asset'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-stone-200">
          {['Overview', 'Technicals', 'Institutional'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'Overview' && (
              <>
                {/* Standard Price Chart */}
                <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Live Price Action</span>
                    <div className="flex gap-1">
                      {['1W', '1M', '3M', '1Y'].map(r => (
                        <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 text-[10px] font-bold ${range === r ? 'bg-stone-900 text-stone-50' : 'bg-stone-100 text-stone-500'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ohlcData}>
                        <defs>
                          <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                        <XAxis dataKey="date" hide />
                        <YAxis orientation="right" domain={['auto', 'auto']} stroke="#a8a29e" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Area type="monotone" dataKey="close" stroke="#1c1917" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Market Cap', value: summary.marketCap ? `$${(summary.marketCap / 1e12).toFixed(2)}T` : 'N/A', icon: Target },
                    { label: 'ROE (TTM)', value: institutional?.metrics?.roe ? `${(institutional.metrics.roe * 100).toFixed(2)}%` : 'N/A', icon: Activity },
                    { label: 'Net Margin', value: institutional?.metrics?.netMargin ? `${(institutional.metrics.netMargin * 100).toFixed(2)}%` : 'N/A', icon: Zap },
                    { label: '52W High', value: `$${summary.fiftyTwoWeekHigh?.toFixed(2)}` || 'N/A', icon: TrendingUp },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-stone-200 p-4 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-3 h-3 text-stone-400" />
                        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</div>
                      </div>
                      <div className="text-lg font-bold text-stone-900">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2"><Info className="w-4 h-4" /> Business Profile</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{summary.description}</p>
                </div>
              </>
            )}

            {activeTab === 'Technicals' && (
              <div className="space-y-8">
                {/* Composed Technical Chart */}
                <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Trend Surveillance</span>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5 bg-blue-500" />
                          <span className="text-[9px] font-bold text-stone-500 uppercase">SMA 50: ${technicals?.currentSMA50}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5 bg-orange-500" />
                          <span className="text-[9px] font-bold text-stone-500 uppercase">SMA 200: ${technicals?.currentSMA200}</span>
                        </div>
                      </div>
                    </div>
                    {technicals?.rsi && (
                      <div className={`px-4 py-2 border ${technicals.rsi > 70 ? 'bg-red-50 border-red-200 text-red-700' : technicals.rsi < 30 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-stone-50 border-stone-200 text-stone-700'}`}>
                        <div className="text-[9px] font-bold uppercase tracking-widest">RSI (14)</div>
                        <div className="text-xl font-bold">{technicals.rsi}</div>
                      </div>
                    )}
                  </div>
                  <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={technicals?.history || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis orientation="right" domain={['auto', 'auto']} stroke="#a8a29e" fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Area type="monotone" dataKey="close" stroke="#1c1917" strokeWidth={1} fill="#fafaf9" />
                        <Line type="monotone" dataKey="sma50" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="sma200" stroke="#f97316" strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-stone-900 p-8 text-stone-50 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Technical Signal</h3>
                  </div>
                  <p className="text-sm text-stone-400 leading-relaxed font-medium">
                    {technicals?.rsi > 70 ? "WARNING: Asset is currently overbought. Expect short-term resistance." : 
                     technicals?.rsi < 30 ? "OPPORTUNITY: Asset is currently oversold. Potential mean reversion likely." : 
                     "STABLE: Asset is trading within normal volatility bands."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'Institutional' && (
              <div className="space-y-8">
                <div className="bg-white border border-stone-200 p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                    <BarChart3 className="w-5 h-5 text-stone-900" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Insider Surveillance</h3>
                  </div>
                  <div className="bg-stone-50 border border-stone-100 p-6 italic text-stone-700 text-sm leading-relaxed border-l-4 border-l-stone-900">
                    "{institutional?.insiderSummary}"
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] uppercase font-bold tracking-tight">
                      <thead>
                        <tr className="text-stone-400 border-b border-stone-100">
                          <th className="py-3 px-2">Month</th>
                          <th className="py-3 px-2">Buy (Shares)</th>
                          <th className="py-3 px-2">Sell (Shares)</th>
                        </tr>
                      </thead>
                      <tbody className="text-stone-600">
                        {institutional?.insiderRaw?.map((row, i) => (
                          <tr key={i} className="border-b border-stone-50">
                            <td className="py-3 px-2">{row.month}/{row.year}</td>
                            <td className="py-3 px-2 text-green-600">+{row.buy?.toLocaleString() || '0'}</td>
                            <td className="py-3 px-2 text-red-600">-{row.sell?.toLocaleString() || '0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Correlation Widget Concept */}
                <div className="bg-stone-900 text-stone-50 p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-white">Correlation Engine</h3>
                    </div>
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-tighter">BETA: 1.25</span>
                  </div>
                  <p className="text-sm text-stone-400 font-medium leading-relaxed">
                    This asset shows an 82% correlation with <span className="text-white underline underline-offset-4">NASDAQ (QQQ)</span>. 
                    Macro-level shifts in treasury yields are currently the primary external driver for ${symbol}.
                  </p>
                  <div className="pt-4 border-t border-stone-800">
                    <div className="text-[9px] font-bold text-stone-600 uppercase">Analysis Engine: Llama 3.3 Institutional</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Unified AI Intelligence */}
          <div className="space-y-8">
            <div className="bg-stone-900 text-stone-50 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-stone-700 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-stone-400" /> AI Sentiment
                </h3>
                {analysis && (
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-sm ${
                    analysis.sentiment === 'Bullish' ? 'bg-green-500 text-stone-950' : 
                    analysis.sentiment === 'Bearish' ? 'bg-red-500 text-stone-50' : 'bg-stone-700'
                  }`}>
                    {analysis.sentiment}
                  </span>
                )}
              </div>

              {analysisLoading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3 text-stone-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Scanning News...</span>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  <p className="text-sm leading-relaxed text-stone-300 italic border-l-2 border-stone-700 pl-4">
                    "{analysis.summary}"
                  </p>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Bull Case</div>
                      {analysis.bullCase.map((point, i) => (
                        <div key={i} className="flex gap-2 text-xs text-stone-400 leading-snug">
                          <div className="w-1 h-1 bg-green-500 mt-1.5 shrink-0" />
                          {point}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Bear Case</div>
                      {analysis.bearCase.map((point, i) => (
                        <div key={i} className="flex gap-2 text-xs text-stone-400 leading-snug">
                          <div className="w-1 h-1 bg-red-500 mt-1.5 shrink-0" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Institutional News */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest border-b border-stone-200 pb-2">Intelligence Feed</h3>
              <div className="space-y-4">
                {news.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white border border-stone-200 shadow-sm hover:border-stone-400 transition-all group">
                    <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">{item.publisher}</div>
                    <div className="text-sm font-bold text-stone-900 leading-snug group-hover:underline">{item.title}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
