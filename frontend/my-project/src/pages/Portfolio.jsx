import React, { useState } from 'react';
import { DollarSign, Wallet, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import Header from '../components/Header';

export default function PortfolioPage() {
  const [currentPage, setCurrentPage] = useState('portfolio');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1D');

  const timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];



  const portfolioMetrics = [
    {
      title: 'Total Value',
      value: '$105,420.67',
      icon: DollarSign,
      gradient: 'from-amber-400 to-yellow-500',
      bgGradient: 'from-amber-50 to-yellow-100',
      iconColor: 'text-white'
    },
    {
      title: 'Cash Balance',
      value: '$25,420.67',
      icon: Wallet,
      gradient: 'from-yellow-400 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-100',
      iconColor: 'text-white'
    },
    {
      title: 'Total P&L',
      value: '$5,420.67',
      change: '+5.42%',
      positive: true,
      icon: TrendingUp,
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-100',
      iconColor: 'text-white'
    },
    {
      title: 'Positions',
      value: '3',
      icon: Clock,
      gradient: 'from-orange-400 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-100',
      iconColor: 'text-white'
    }
  ];

  const currentPositions = [
    {
      symbol: 'AAPL',
      shares: 50,
      avgPrice: 175.23,
      currentPrice: 149.40,
      change: -1291.67,
      changePercent: -14.74,
      positive: false
    },
    {
      symbol: 'GOOGL',
      shares: 25,
      avgPrice: 138.45,
      currentPrice: 142.56,
      change: 102.75,
      changePercent: 2.97,
      positive: true
    },
    {
      symbol: 'MSFT',
      shares: 30,
      avgPrice: 365.78,
      currentPrice: 378.92,
      change: 394.20,
      changePercent: 3.59,
      positive: true
    }
  ];

  const recentTransactions = [
    {
      type: 'BUY',
      symbol: 'AAPL',
      quantity: 50,
      price: 175.23,
      total: 8761.50,
      date: '1/15/2024'
    },
    {
      type: 'BUY',
      symbol: 'GOOGL',
      quantity: 25,
      price: 138.45,
      total: 3461.25,
      date: '1/14/2024'
    },
    {
      type: 'BUY',
      symbol: 'MSFT',
      quantity: 30,
      price: 365.78,
      total: 10973.40,
      date: '1/13/2024'
    }
  ];

  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Portfolio</h1>
            <p className="text-amber-700 mt-2">Track your investments and performance</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-amber-100/50 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedTimeRange === range
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {portfolioMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const gradients = {
              'Total Value': 'from-blue-500/90 to-indigo-600/90',
              'Cash Balance': 'from-violet-500/90 to-purple-600/90',
              'Total P&L': 'from-emerald-500/90 to-teal-600/90',
              'Positions': 'from-amber-500/90 to-orange-600/90'
            };
            return (
              <div 
                key={index} 
                className="group bg-white rounded-xl p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-amber-800 group-hover:text-amber-900 transition-colors">{metric.title}</h3>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300`}>
                      <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-amber-900">{metric.value}</span>
                  </div>
                  {metric.change && (
                    <div className={`text-sm font-medium ${
                      metric.positive 
                        ? 'text-white bg-gradient-to-r from-green-500 to-emerald-600' 
                        : 'text-white bg-gradient-to-r from-red-500 to-rose-600'
                    } px-3 py-1 rounded-full inline-block shadow-sm`}>
                      {metric.change}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Positions */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-yellow-100/20 to-orange-100/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mr-4 shadow-md">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Current Positions</h2>
                  <p className="text-amber-700 text-sm">Your active stock holdings</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {currentPositions.map((position, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50/30 transition-all duration-200 group border border-amber-100 hover:border-yellow-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg ${position.positive ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'} flex items-center justify-center`}>
                      <span className="font-bold text-base">{position.symbol}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900 group-hover:text-amber-700 transition-colors">{position.symbol}</div>
                      <div className="text-sm text-amber-700">
                        {position.shares} shares @ ${position.avgPrice}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${position.currentPrice}</div>
                    <div className={`text-sm font-medium ${
                      position.positive 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-red-600 bg-red-50'
                    } px-2 py-0.5 rounded-full inline-block`}>
                      {position.positive ? '+' : ''}{position.change} ({position.positive ? '+' : ''}{position.changePercent}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-yellow-100/20 to-orange-100/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mr-3 shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Recent Transactions</h2>
                <p className="text-amber-700 text-sm">Your latest trading activity</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50/30 transition-all duration-200 group border border-amber-100 hover:border-yellow-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      transaction.type === 'BUY' 
                        ? 'bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-gradient-to-br from-red-100 to-rose-100 text-red-700 border border-red-200'
                    }`}>
                      <span className="font-bold text-sm">{transaction.type}</span>
                    </div>
                    <div>
                      <div className="font-medium text-amber-900 group-hover:text-amber-700 transition-colors">
                        {transaction.quantity} {transaction.symbol}
                      </div>
                      <div className="text-sm text-amber-700">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${transaction.price}</div>
                    <div className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                      Total: ${transaction.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}