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
import portfolioRoutes from './routes/portfolio.js';
import ordersRoutes from './routes/orders.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { WebSocketServer } from 'ws'; // ✅ Import WebSocketServer
import http from 'http';
import yahooFinance from "yahoo-finance2";
import scheduleDataSync from './jobs/datasync.js';


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


async function updateRealPrices() {
    const activeSubscriptions = new Set();
    clients.forEach(client => {
        client.subscriptions.forEach(sub => activeSubscriptions.add(sub));
    });

    if (activeSubscriptions.size === 0) return;

    console.log('Fetching real prices for active symbols:', Array.from(activeSubscriptions));
    for (const symbol of activeSubscriptions) {
        try {
            const ticker = `${symbol}.NS`;
            const quote = await yahooFinance.quote(ticker);
            if (quote && quote.regularMarketPrice) {
                symbolCache.set(symbol, quote.regularMarketPrice);
            }
        } catch (err) {
            console.error(`Failed to fetch price for ${symbol}:`, err.message);
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

    if(message.action === 'subscribe' && Array.isArray(message.symbols)) {
      message.symbols.forEach(symbol => clientData.subscriptions.add(symbol.toUpperCase()));
      console.log(`Client ${clientId} subscribed to:`, Array.from(clientData.subscriptions));
      updateRealPrices();
    }
    else if(message.action === 'unsubscribe' && Array.isArray(message.symbols)) {
    message.symbols.forEach(symbol => clientData.subscriptions.delete(symbol.toUpperCase()));
    }
  }catch(err) {
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
        
        updates.push({
            symbol: `${symbol}.NS`,
            price: parseFloat(newPrice.toFixed(2)),
            timestamp: Date.now()
        });
    });

    if (updates.length === 0) return;
    
    const payload = JSON.stringify({ event: 'price-update', ticks: updates });

    // Send the updates to all connected clients
    clients.forEach(client => {
        if (client.connection.readyState === client.connection.OPEN) {
            client.connection.send(payload);
        }
    });
}
setInterval(broadcastPrices, 2000);
setInterval(updateRealPrices, 7200000);

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
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

scheduleDataSync();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
