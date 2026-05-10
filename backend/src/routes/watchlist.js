import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import User from "../models/User.js";
import { ensureAuth } from "../middleware/auth.js";
import { finnhubService } from "../services/finnhubService.js";
import OHLC from "../models/OHLC.js";

const router = express.Router();
dotenv.config();

router.get("/", ensureAuth, async (req, res) => {
    try {
        // Fetch fresh user to ensure watchlist is up to date
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const watchlist = await Promise.all(
            (user.watchlist || []).map(async (symbol) => {
                try {
                    const quote = await finnhubService.getQuote(symbol);
                    return {
                        symbol,
                        openPrice: quote.open || quote.prevClose || quote.price || 0,
                    };
                } catch (err) {
                    console.error(`Finnhub error for ${symbol} in watchlist:`, err.message);
                    const latestEntry = await OHLC.findOne({ symbol }).sort({ timestamp: -1 });
                    return {
                        symbol,
                        openPrice: latestEntry?.open ?? latestEntry?.close ?? 0,
                    };
                }
            })
        );

        res.json(watchlist);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching watchlist.' });
    }
});

router.post("/", ensureAuth, async (req, res) => {
    try {
        const { symbol } = req.body;
        if(!symbol) {
            return res.status(400).json({ message: 'Symbol is required.' });
        }

        const ticker = symbol.toUpperCase();

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { watchlist: ticker } },
            { new: true }
        );

        res.json(updatedUser.watchlist);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while adding to watchlist.' });
    }
});


router.delete("/:symbol", ensureAuth, async (req, res) =>{
    try {
        const { symbol } = req.params;
        const ticker = symbol.toUpperCase();
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { watchlist: ticker } },
            { new: true }
        );

        res.json(updatedUser.watchlist);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while removing from watchlist.' });
    }
});

export default router;
