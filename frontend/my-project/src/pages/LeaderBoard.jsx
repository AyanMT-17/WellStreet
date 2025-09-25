import React, { useState } from 'react';
import { Users, Trophy, TrendingUp, Globe, Award } from 'lucide-react';
import Header from '../components/Header';

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState('leaderboard');

  const leaderboardData = [
    {
      rank: 1,
      username: 'TraderPro',
      trades: 156,
      pnl: '+$25420.67',
      winRate: '78.5%',
      isTop: true,
      trophy: 'gold'
    },
    {
      rank: 2,
      username: 'MarketMaster',
      trades: 143,
      pnl: '+$18750.23',
      winRate: '72.3%',
      isTop: true,
      trophy: 'silver'
    },
    {
      rank: 3,
      username: 'StockWizard',
      trades: 89,
      pnl: '+$15060.45',
      winRate: '69.8%',
      isTop: true,
      trophy: 'bronze'
    }
  ];

  const getTrophyColor = (trophy) => {
    switch (trophy) {
      case 'gold': return 'text-amber-400';
      case 'silver': return 'text-amber-200';
      case 'bronze': return 'text-amber-600';
      default: return 'text-amber-300';
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Leaderboard</h1>
            <p className="text-amber-700 mt-2">See how you rank against other traders</p>
          </div>
          
          <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-200/50 shadow-md">
            <Globe className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-sm font-medium text-amber-700">Global League</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Total Traders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-amber-700">Total Traders</h3>
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-md flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">1,247</span>
            </div>
            <div className="text-sm text-amber-600">Active this month</div>
          </div>

          {/* Your Rank */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-amber-700">Your Rank</h3>
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-md flex items-center justify-center shadow-md">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">#15</span>
            </div>
            <div className="text-sm text-amber-600">+$5420.67</div>
          </div>

          {/* Top Performer */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-amber-700">Top Performer</h3>
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-md flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">TraderPro</span>
            </div>
            <div className="text-sm text-amber-600">Highest returns (+$25420.67)</div>
          </div>
        </div>

        {/* Your Performance */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-amber-200/50 mb-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent mb-2">Your Performance</h2>
          <p className="text-amber-700 text-sm mb-6">Your current standing in the global league</p>
          
          <div className="flex items-center justify-between py-4 px-4 bg-amber-50/80 rounded-lg border border-amber-100">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg mr-4 shadow-md">
                <span className="text-sm font-bold text-white">#15</span>
              </div>
              <div>
                <div className="font-semibold text-amber-900">You</div>
                <div className="text-sm text-amber-700">32 trades</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-amber-600">+$5420.67</div>
              <div className="text-sm text-amber-700">66.2% Win Rate</div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-amber-200/50 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-md flex items-center justify-center shadow-md mr-3">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Global Leaderboard</h2>
          </div>
          <p className="text-amber-700 text-sm mb-6">Top performers in the current period</p>
          
          <div className="space-y-4">
            {leaderboardData.map((trader, index) => (
              <div key={index} className="flex items-center justify-between py-4 px-4 bg-amber-50/80 rounded-lg border border-amber-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg mr-4 shadow-md">
                    {trader.rank <= 3 ? (
                      <Trophy className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-white">#{trader.rank}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-amber-900">{trader.username}</div>
                    <div className="text-sm text-amber-700">{trader.trades} trades</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-amber-600">{trader.pnl}</div>
                  <div className="text-sm text-amber-700">{trader.winRate} Win Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-amber-200/50 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent mb-3">
            Climb the Rankings
          </h3>
          <p className="text-amber-700 mb-6 max-w-md mx-auto">
            Improve your trading skills and compete for the top spot on the leaderboard.
          </p>
          <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-md font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md">
            Start Trading
          </button>
        </div>
      </main>
    </div>
  );
}