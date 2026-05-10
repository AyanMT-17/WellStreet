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
    }
  }

  useEffect(() => {
    fetchLeaderboard();
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#fccc07]">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-black uppercase tracking-wider inline-block bg-white px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_#000] rotate-1">Leaderboard</h1>
            <p className="text-black font-bold mt-4 uppercase tracking-wide bg-white inline-block px-3 border-2 border-black rotate-[-1deg]">See how you rank against other traders</p>
          </div>

          <div className="flex items-center bg-black px-6 py-3 border-4 border-white shadow-[4px_4px_0px_0px_#000]">
            <Globe className="w-5 h-5 text-white mr-3 animate-pulse" />
            <span className="text-base font-black text-white uppercase tracking-widest">Global League</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000] transition-all">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h3 className="text-sm font-black text-black uppercase tracking-widest">Total Traders</h3>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-black text-black">{leaderboardData.length}</span>
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active this month</div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000] transition-all">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h3 className="text-sm font-black text-black uppercase tracking-widest">Your Rank</h3>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-black text-black">#15</span>
            </div>
            <div className="text-sm text-green-600 font-extrabold font-mono">+$5420.67</div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000] transition-all">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h3 className="text-sm font-black text-black uppercase tracking-widest">Top Performer</h3>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-3xl font-black text-black">TraderPro</span>
            </div>
            <div className="text-sm text-green-600 font-extrabold font-mono">Highest returns (+$25420.67)</div>
          </div>
        </div>

        {/* Your Performance */}
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] mb-12">
          <h2 className="text-2xl font-black text-black uppercase tracking-wide mb-2">Your Performance</h2>
          <p className="text-black font-bold text-sm mb-6 bg-yellow-200 inline-block px-2">Your current standing in the global league</p>

          <div className="flex items-center justify-between py-6 px-6 bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_#888]">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-14 h-14 bg-white text-black border-2 border-black font-black text-xl mr-6 shadow-[2px_2px_0px_0px_#fff]">
                #15
              </div>
              <div>
                <div className="font-black text-2xl uppercase tracking-wider">You</div>
                <div className="text-sm font-medium text-gray-300">32 trades</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-green-400 text-xl font-mono">+$5,420.67</div>
              <div className="text-sm font-bold text-gray-400 uppercase">66.2% Win Rate</div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard */}
        <div className="bg-white border-4 border-black p-0 shadow-[12px_12px_0px_0px_#000] mb-12">
          <div className="p-6 border-b-4 border-black bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 border-2 border-black bg-black flex items-center justify-center mr-4 shadow-[2px_2px_0px_0px_#000]">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-wide">Global Rankings</h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest border-2 border-black px-2 py-1 bg-white">Top Performers</p>
          </div>

          <div className="p-6 space-y-4">
            {leaderboardData.map((trader, index) => (
              <div key={index} className="flex items-center justify-between py-4 px-6 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-transform">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 border-2 border-black font-black text-lg mr-6 shadow-[2px_2px_0px_0px_#000] ${trader.rank <= 3 ? 'bg-yellow-400 text-black' : 'bg-white text-black'}`}>
                    {trader.rank <= 3 ? (
                      <Trophy className="w-6 h-6 text-black fill-current" />
                    ) : (
                      <span>#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-xl text-black uppercase tracking-wide">{profileData == trader.email ? "YOU" : trader.name}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase">{trader.portfolioValue} Value</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-green-600 text-xl font-mono">{trader.percentageGain}</div>
                  <div className="text-xs font-bold text-black uppercase tracking-wide border-t-2 border-black mt-1 pt-1">{trader.winRate} Win Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-black border-4 border-black p-10 shadow-[12px_12px_0px_0px_#fff] text-center mb-12">
          <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#888]">
            <Trophy className="w-10 h-10 text-black" />
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
            Climb the Rankings
          </h3>
          <p className="text-gray-300 font-medium mb-8 max-w-lg mx-auto text-lg">
            Improve your trading skills and compete for the top spot on the leaderboard in the Global League.
          </p>
          <button className="bg-[#fccc07] text-black border-2 border-white px-8 py-4 font-black uppercase tracking-widest text-lg hover:bg-white hover:text-black hover:border-[#fccc07] transition-all shadow-[6px_6px_0px_0px_#fff]">
            Start Trading Now
          </button>
        </div>
      </main>
    </div>
  );
}