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
import http from 'http';
import yahooFinance from "yahoo-finance2";
import scheduleDataSync from './jobs/datasync.js';
import User from "./models/User.js";

import { initWebSocket } from './services/websocketService.js';

dotenv.config();
const app = express();

// connect to MongoDB
connectDB();

// ✅ Create an HTTP server from the Express app
const server = http.createServer(app);

// ✅ Initialize WebSocket server
initWebSocket(server);

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
      id: decoded.id,
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
