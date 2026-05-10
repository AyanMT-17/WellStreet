import express from "express";
import session from "express-session";
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
import scheduleDataSync from './jobs/datasync.js';
import { initWebSocket } from './services/websocketService.js';

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Create HTTP server for WebSockets
const server = http.createServer(app);
initWebSocket(server);

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", 
  process.env.FRONTEND_URL
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Session Configuration for Production (Render)
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
    app.set('trust proxy', 1); // Required for cookies to work on Render/Heroku
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/auth", authRoutes);
app.use("/market", marketRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/portfolio", portfolioRoutes);

app.get("/", (req, res) => res.send("WellStreet Terminal API is running 🚀"));

app.get("/profile", (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.avatar,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

scheduleDataSync();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
