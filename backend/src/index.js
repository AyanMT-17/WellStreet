import express from "express";
import session from "express-session";   // ✅ use ONLY express-session
import passport from "passport";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import "./services/passport.js";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import marketRoutes from "./routes/market.js";
import watchlistRoutes from "./routes/watchlist.js";
import portfolioRoutes from "./routes/portfolio.js"
import ordersRoutes from './routes/orders.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { WebSocketServer } from 'ws'; // ✅ Import WebSocketServer
import http from 'http';
import yahooFinance from "yahoo-finance2";
import scheduleDataSync from './jobs/datasync.js';
import User from "./models/User.js";

dotenv.config();
const app = express();

// connect to MongoDB
connectDB();

// ✅ Create an HTTP server from the Express app
const server = http.createServer(app);

// ✅ Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocketServer({ server });


const clients = new Map();
const symbolCache = new Map();

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateRealPrices() {
  const activeSubscriptions = new Set();
  clients.forEach(client => {
    client.subscriptions.forEach(sub => activeSubscriptions.add(sub));
  });

  if (activeSubscriptions.size === 0) return;

  console.log('Fetching real prices for active symbols:', Array.from(activeSubscriptions));

  // Process symbols sequentially with delay to avoid rate limiting
  const symbolsArray = Array.from(activeSubscriptions);
  for (let i = 0; i < symbolsArray.length; i++) {
    const symbol = symbolsArray[i];
    try {
      // If symbol already ends with .NS (case-insensitive), don't append it again
      const ticker = symbol.toUpperCase().endsWith('.NS') ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;
      const quote = await yahooFinance.quote(ticker);
      if (quote && quote.regularMarketPrice) {
        symbolCache.set(symbol, quote.regularMarketPrice);
      }
    } catch (err) {
      // Only log non-rate-limit errors at error level
      if (err.message?.includes('Too Many Requests') || err.message?.includes('429')) {
        console.log(`Rate limited for ${symbol}, trying database fallback`);
      } else {
        console.error(`Failed to fetch price for ${symbol}:`, err.message);
      }

      // FALLBACK: Try to get last close price from database
      try {
        const { default: OHLC } = await import('./models/OHLC.js');
        const ticker = symbol.toUpperCase().endsWith('.NS') ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;
        const latestOhlc = await OHLC.findOne({ symbol: ticker }).sort({ timestamp: -1 });
        if (latestOhlc && latestOhlc.close) {
          console.log(`Using database fallback price for ${symbol}: ${latestOhlc.close}`);
          symbolCache.set(symbol, latestOhlc.close);
        }
      } catch (dbErr) {
        console.error(`Database fallback also failed for ${symbol}:`, dbErr.message);
      }
    }

    // Add delay between requests to avoid rate limiting (1.5 seconds)
    if (i < symbolsArray.length - 1) {
      await delay(1500);
    }
  }
}



wss.on('connection', (ws, req) => {
  console.log('Client connected to WebSocket');
  const clientId = Date.now();
  clients.set(clientId, { connection: ws, subscriptions: new Set() });

  ws.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage);
      const clientData = clients.get(clientId);

      if (message.action === 'subscribe' && Array.isArray(message.symbols)) {
        message.symbols.forEach(symbol => clientData.subscriptions.add(symbol.toUpperCase()));
        console.log(`Client ${clientId} subscribed to:`, Array.from(clientData.subscriptions));
        updateRealPrices();
      }
      else if (message.action === 'unsubscribe' && Array.isArray(message.symbols)) {
        message.symbols.forEach(symbol => clientData.subscriptions.delete(symbol.toUpperCase()));
      }
    } catch (err) {
      console.error('Error processing message:', err);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    clients.delete(clientId);
  });

});


function broadcastPrices() {
  const updates = [];

  symbolCache.forEach((basePrice, symbol) => {
    // Simulate a small fluctuation (e.g., +/- 0.05%)
    const fluctuation = (Math.random() - 0.5) * 0.001;
    const newPrice = basePrice * (1 + fluctuation);

    // Don't add .NS if it already has it
    const formattedSymbol = symbol.toUpperCase().endsWith('.NS') ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;

    updates.push({
      symbol: formattedSymbol,
      price: parseFloat(newPrice.toFixed(2)),
      timestamp: Date.now()
    });
  });

  if (updates.length === 0) {
    // If cache is empty, nothing to broadcast
    return;
  }

  const payload = JSON.stringify({ event: 'price-update', ticks: updates });

  // Send the updates to all connected clients
  clients.forEach(client => {
    if (client.connection.readyState === client.connection.OPEN) {
      client.connection.send(payload);
    }
  });
}
setInterval(broadcastPrices, 2000);
setInterval(updateRealPrices, 2000000);

// CORS setup (allow frontend to send cookies)
app.use(
  cors({
    origin: "http://localhost:5173", // your React app URL
    credentials: true,               // allow cookies/session
  })
);

app.use(cookieParser());

// Sessions (must be BEFORE passport.session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only if HTTPS
      httpOnly: true,
    },
  })
);



// Passport init + sessions
app.use(passport.initialize());
app.use(passport.session());

// Parse JSON requests
app.use(express.json());



// API routes
app.use("/auth", authRoutes);
app.use("/market", marketRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/orders", ordersRoutes);
app.use("/leaderboard", leaderboardRoutes);

// Test route
app.get("/", (req, res) => res.send("Simulated Trading API is running 🚀"));

app.get("/profile", (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    res.json({
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.avatar,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

scheduleDataSync();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
