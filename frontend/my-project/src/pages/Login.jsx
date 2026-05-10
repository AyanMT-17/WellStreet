import React from "react";

export default function WellStreetLogin() {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-card p-8 sm:p-12">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-stone-900 text-sm font-bold text-stone-50">
              W
            </div>
            <div>
              <div className="hero-kicker">Equity Intelligence</div>
              <div className="text-2xl font-bold tracking-tight text-stone-900">WellStreet Terminal</div>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="hero-kicker">Authorization Required</p>
            <h1 className="hero-title mt-2">Professional US Market Data for Retail Analysts.</h1>
            <p className="hero-copy mt-4">
              Sign in to access real-time US equity feeds, AI-driven sentiment analysis, and professional-grade business profiling.
            </p>
          </div>

          <div className="mt-12">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-4 border border-stone-200 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-900 shadow-sm transition hover:bg-stone-50 sm:w-auto"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.09A7.03 7.03 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-12 border-t border-stone-100 pt-10">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-stone-900 uppercase tracking-widest">Real-time Feeds</div>
                <p className="text-xs leading-relaxed text-stone-500 font-medium">WebSocket-driven pricing for major US indices and equities.</p>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-stone-900 uppercase tracking-widest">AI Synthesis</div>
                <p className="text-xs leading-relaxed text-stone-500 font-medium">Instant Llama 3.3 sentiment analysis based on institutional news.</p>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-stone-900 uppercase tracking-widest">Deep Intelligence</div>
                <p className="text-xs leading-relaxed text-stone-500 font-medium">Business summaries, analyst recommendations, and fundamental data.</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="surface-card flex flex-col justify-between p-8 sm:p-12 bg-stone-900 text-stone-50 border-stone-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Terminal Philosophy</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white leading-tight">Focus on data, not decoration.</h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-400 font-medium">
              We've stripped away the noise of traditional trading apps to build a high-density research environment. One theme, one market, total focus.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Warm Minimalism</div>
              <p className="text-xs text-stone-500 font-medium">A stone-palette interface designed for long research sessions.</p>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Global Surveillance</div>
              <p className="text-xs text-stone-500 font-medium">Monitor the entire S&P 500 from a single command center.</p>
            </div>
          </div>

          <p className="mt-12 text-[10px] font-bold text-stone-600 uppercase tracking-widest">
            Institutional Grade Access
          </p>
        </aside>
      </div>
    </div>
  );
}
