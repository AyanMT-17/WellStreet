# WellStreet Terminal: Professional AI Financial Intelligence

WellStreet Terminal is a high-density, institutional-grade financial research platform designed for retail analysts. It strips away the gamified noise of traditional trading apps, providing a minimalist "Bloomberg-lite" experience focused on data surveillance, technical indicators, and AI-driven market intelligence.

> **Project Philosophy:** Focus on Data, Not Decoration.

---

## 🧐 The "Why": Strategic Project Pivot

Originally conceived as a stock simulator, WellStreet has been re-engineered into a Research Terminal. This shift was driven by the recognition that **information parity** is the greatest barrier for retail investors.

### Why US Markets?
- **Data Maturation**: The US (NYSE/NASDAQ) offers the world's most transparent and accessible institutional data via professional APIs.
- **AI Fuel**: High news volume for US mega-caps allows our LLM (Groq) to perform deep "Implication Analysis" that is impossible in thinner markets.
- **Global Relevance**: The S&P 500 is the heartbeat of global finance; our terminal mirrors the toolset used by top-tier desks in New York and London.

### Why "Warm Minimalist" UI?
- **Low Fatigue**: Standard dark modes or bright consumer apps cause eye strain during long research sessions. The "Stone Palette" aesthetic is designed for sustained focus.
- **Information Density**: We use sharp (0px) corners and tabbed interfaces to maximize data-per-pixel, inspired by professional platforms like Bloomberg and Reuters Eikon.

---

## 🚀 Core Features & Intelligence

### 1. AI Intelligence Engine (Alpha Generation)
- **Senior Principal Persona**: Powered by **Groq Llama 3.3-70B**, the AI doesn't just recap news—it identifies "Bull Traps," structural risks, and institutional intent.
- **Adversarial Insider Auditor**: A specialized pipeline that audits SEC Form 4 data to determine management's true conviction (Buy/Sell signals).
- **30-Day Sentiment X-Ray**: Scans a wide window of press releases to provide a definitive Bullish/Bearish/Cautious stance.

### 2. Technical Surveillance Suite
- **Math-Driven Indicators**: Custom-built math utilities calculate **RSI (14)** and **Moving Averages (50/200 SMA)** locally for ultra-fast performance.
- **Trend-Mapping**: High-density Recharts integration overlays professional trend lines onto historical price action.
- **High-Resilience Fallback**: If upstream data providers are restricted, the terminal utilizes a "Terminal Cache" mode to maintain research continuity.

### 3. Real-Time Surveillance Engine
- **Volatility Radar**: A WebSocket-driven backend monitors the entire 100+ stock watchlist in memory. 
- **Urgent Alerts**: If an asset moves >2% in a single cycle, the terminal broadcasts a "Red Alert" toast notification across all connected clients instantly.

---

## 🛠️ Technical Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Component-based architecture for high-density UI state management. |
| **Styling** | Tailwind CSS | Utility-first approach for precise, professional design control. |
| **Charts** | Recharts | SVG-based charting allowing for complex overlays of Technical Indicators. |
| **Backend** | Node.js / Express | Event-driven architecture suitable for real-time WebSocket signals. |
| **Database** | MongoDB | Document-store model for flexible OHLC (Price) and Watchlist storage. |
| **AI LLM** | Groq (Llama 3.3) | Selected for its **ultra-low latency**, critical for real-time terminal analysis. |
| **Data API** | Finnhub.io | Professional REST API providing institutional news and financials. |
| **Real-time** | WebSockets (WS) | Bidirectional communication for volatility alerts and live price updates. |

---

## 🚦 System Architecture

1.  **Data Ingestion**: Backend polls Finnhub/Yahoo for prices and news.
2.  **State Management**: Real-time prices are cached in memory; historical history is stored in MongoDB.
3.  **Intelligence Pipeline**: News context is piped to Groq; JSON analysis is streamed to the Frontend.
4.  **UI Render**: High-density React components render the "X-Ray" view based on active tab state.

---

## 📦 Installation & Configuration

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas (or local instance)
- **API Keys**: Finnhub.io (Free), Groq Cloud (Free/Paid).

### 1. Backend Setup
```bash
cd WellStreet/backend
npm install
```
**Environment Variables (`.env`):**
```env
MONGO_URI=your_mongodb_connection_string
FINNHUB_API_KEY=your_finnhub_key
GROQ_API_KEY=your_groq_key
JWT_SECRET=any_random_string
GOOGLE_CLIENT_ID=your_oauth_id
GOOGLE_CLIENT_SECRET=your_oauth_secret
```
**Data Seeding:**
```bash
node seed_mock_data.js  # Seeds 300 days of history for 100 stocks
npm run dev
```

### 2. Frontend Setup
```bash
cd WellStreet/frontend/my-project
npm install
```
**Environment Variables (`.env`):**
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```
```bash
npm run dev
```

---
*Disclaimer: WellStreet Terminal is for educational and research purposes only. It is not an investment advisory platform.*
