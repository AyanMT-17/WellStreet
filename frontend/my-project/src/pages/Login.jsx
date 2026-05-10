import React, { useEffect } from 'react';

export default function WellStreetLogin() {

  useEffect(() => {
    async function fetchProfile() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      const data = await response.json();
      console.log('Profile data:', data);
    }
    fetchProfile();
  }, []);

  const handleGoogleLogin = () => {
    console.log('Redirecting to Google OAuth...');
    console.log(import.meta.env.VITE_API_URL);
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#fccc07] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
            <span className="text-white font-black text-xl">W</span>
          </div>
          <span className="text-3xl font-black text-black uppercase tracking-tighter">WellStreet</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] p-10 relative">
            {/* Decoration Element */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-black border-4 border-white shadow-[4px_4px_0px_0px_#000] z-10 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[6px_6px_0px_0px_#888]">
                <span className="text-white font-black text-4xl">W</span>
              </div>
              <h1 className="text-3xl font-black text-black uppercase tracking-wide mb-2">Welcome Back</h1>
              <p className="text-black font-bold uppercase tracking-wider bg-yellow-200 inline-block px-2">Sign in to your dashboard</p>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border-3 border-black px-6 py-4 flex items-center justify-center space-x-4 hover:bg-black hover:text-white transition-all duration-200 shadow-[6px_6px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] group"
            >
              <svg className="w-6 h-6 group-hover:fill-white" viewBox="0 0 24 24">
                <path
                  className="group-hover:fill-white"
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  className="group-hover:fill-white"
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  className="group-hover:fill-white"
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  className="group-hover:fill-white"
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-black text-lg uppercase tracking-wide">Enter with Google</span>
            </button>

            {/* Features Preview */}
            <div className="mt-10 pt-8 border-t-4 border-black">
              <p className="text-xs font-black text-black uppercase tracking-widest text-center mb-6 bg-gray-100 py-1 border-2 border-black -rotate-1">Access Features</p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#888]">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-black font-bold text-sm uppercase">Portfolio & Analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#888]">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-black font-bold text-sm uppercase">Real-time P&L Updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#888]">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-black font-bold text-sm uppercase">Transaction History</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs font-bold text-black uppercase tracking-wide">
              By signing in, you agree to our{' '}
              <a href="#" className="underline decoration-2 hover:bg-black hover:text-white transition-colors px-1">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="underline decoration-2 hover:bg-black hover:text-white transition-colors px-1">
                Privacy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}