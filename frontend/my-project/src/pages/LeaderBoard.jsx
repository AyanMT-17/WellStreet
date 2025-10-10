import { useEffect, useState } from 'react';
import { Users, Trophy, TrendingUp, Globe, Award } from 'lucide-react';
import Header from '../components/Header';

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState('leaderboard');
  const [leaderboardData, setleaderboardData] = useState([]);
  const [profileData, setProfileData] = useState("");

  async function fetchLeaderboard() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Leaderboard data:', data);
      setleaderboardData(data || []);

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  }
      async function fetchProfile() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Profile data:', data);
            setProfileData(data.email);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(prev => ({ ...prev, profile: err.message }));
        }
    }

  useEffect(() => {
    fetchLeaderboard();
    fetchProfile();
  }, []);

  return (
    // THEME UPDATE: Main background changed to light gray
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* THEME UPDATE: Removed gradient text for a solid, clean header */}
            <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
            <p className="text-gray-500 mt-2">See how you rank against other traders</p>
          </div>
          
          {/* THEME UPDATE: Styled the badge with the new gray theme */}
          <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Globe className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Global League</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* THEME UPDATE: Card styles updated for consistency (white bg, gray border, shadow) */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Traders</h3>
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-gray-800">{leaderboardData.length}</span>
            </div>
            <div className="text-sm text-gray-500">Active this month</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Your Rank</h3>
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <Award className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-gray-800">#15</span>
            </div>
            <div className="text-sm text-green-600 font-medium">+$5420.67</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Top Performer</h3>
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-gray-800">TraderPro</span>
            </div>
            <div className="text-sm text-green-600 font-medium">Highest returns (+$25420.67)</div>
          </div>
        </div>

        {/* Your Performance */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Performance</h2>
          <p className="text-gray-500 text-sm mb-6">Your current standing in the global league</p>
          
          <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-lg mr-4">
                <span className="text-sm font-bold text-white">#15</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">You</div>
                <div className="text-sm text-gray-500">32 trades</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">+$5420.67</div>
              <div className="text-sm text-gray-500">66.2% Win Rate</div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3">
              <Globe className="w-5 h-5 text-gray-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Global Leaderboard</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">Top performers in the current period</p>
          
          <div className="space-y-2">
            {leaderboardData.map((trader, index) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-lg mr-4">
                    {trader.rank <= 3 ? (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <span className="text-sm font-bold text-white">#{index+1}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{ profileData == trader.email ? "YOU" : trader.name}</div>
                    <div className="text-sm text-gray-500">{trader.portfolioValue} Value</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{trader.percentageGain}</div>
                  <div className="text-sm text-gray-500">{trader.winRate} Win Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Climb the Rankings
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Improve your trading skills and compete for the top spot on the leaderboard.
          </p>
          <button className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors shadow-sm">
            Start Trading
          </button>
        </div>
      </main>
    </div>
  );
}