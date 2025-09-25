import express from "express";
import passport from "passport";
import yahooFinance from "yahoo-finance2";
import { ensureAuth } from "../middleware/auth.js";

const router = express.Router();

router.get('/ohlc/:symbol', ensureAuth, async (req, res) => {
    try {
        const { symbol } = req.params;

        const ticker = symbol.toUpperCase().endsWith('.NS') 
            ? symbol.toUpperCase() 
            : `${symbol.toUpperCase()}.NS`;
        
        const queryOptions = {
        period1: Math.floor(new Date(Date.now() - 24 * 60 * 60 * 1000).getTime() / 1000), // yesterday
        period2: Math.floor(Date.now() / 1000), // today
        interval: '1d', // 1d, 1wk, 1mo
        };

         const result = await yahooFinance.historical(ticker, queryOptions);

         if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No data found for the given symbol' });
            }
        res.json(result);
    } catch (err) {
        console.error(err);
        if (err.message.includes('404 Not Found')) {
             return res.status(404).json({ message: 'Invalid symbol or no data available.' });
        }
        res.status(500).json({ message: 'Server error while fetching market data.' });
    }
});

export default router;
