import express from "express";
import passport from "passport";
import yahooFinance from "yahoo-finance2";
import { ensureAuth } from "../middleware/auth.js";
import getGroqChatCompletion from "../services/groqser.js";
import OHLC from "../models/OHLC.js";
const router = express.Router();

// Simple in-memory cache to reduce API calls
const priceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Rate limiting queue
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between Yahoo requests

async function rateLimitedYahooRequest(ticker, queryOptions) {
    // Ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    // Check cache first
    const cacheKey = `${ticker}-${JSON.stringify(queryOptions)}`;
    const cached = priceCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`Cache hit for ${ticker}`);
        return cached.data;
    }

    // Make the request with retry logic
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const result = await yahooFinance.historical(ticker, queryOptions);
            // Store in cache
            priceCache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        } catch (err) {
            lastError = err;
            console.error(`Yahoo Finance attempt ${attempt + 1} failed for ${ticker}:`, err.message);
            // Wait before retry with exponential backoff
            if (attempt < 2) {
                await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
            }
        }
    }
    throw lastError;
}

router.get('/ohlc/:symbol', ensureAuth, async (req, res) => {
    try {
        const { symbol } = req.params;

        // Step 1: Get the full response object from the AI.
        const groqResponse = await getGroqChatCompletion(symbol);
        console.log("Full response object from Groq:", groqResponse);

        // Step 2: Safely extract the ticker symbol text from the response object.
        const tickerFromGroq = groqResponse?.choices?.[0]?.message?.content;
        console.log("Extracted ticker symbol:", tickerFromGroq);

        // Step 3: Validate the extracted text. If it's empty or invalid, stop here.
        if (!tickerFromGroq || typeof tickerFromGroq !== 'string' || tickerFromGroq.trim() === '') {
            return res.status(400).json({ message: 'Could not determine a valid stock ticker from the input.' });
        }

        // Step 4: Sanitize and format the ticker to ensure it ends with ".NS".
        // Also remove any extra text after the ticker (like explanations)
        let ticker = tickerFromGroq.trim().split('\n')[0].split(' ')[0].toUpperCase();
        if (!ticker.endsWith('.NS')) {
            ticker += '.NS';
        }

        // Step 5: Set a wider date range (7 days) to avoid issues with weekends and holidays.
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const queryOptions = {
            period1: startDate,
            period2: endDate,
            interval: '1d',
        };

        let result;
        try {
            // Step 6: Try to fetch from Yahoo Finance first
            result = await rateLimitedYahooRequest(ticker, queryOptions);
        } catch (yahooErr) {
            console.log(`Yahoo Finance failed for ${ticker}, falling back to database:`, yahooErr.message);

            // FALLBACK: Try to get data from the database instead
            const dbData = await OHLC.find({
                symbol: ticker,
                timestamp: { $gte: startDate, $lte: endDate }
            }).sort({ timestamp: -1 }).limit(7);

            if (dbData && dbData.length > 0) {
                console.log(`Using cached database data for ${ticker}`);
                result = dbData.map(entry => ({
                    date: entry.timestamp,
                    open: entry.open,
                    high: entry.high,
                    low: entry.low,
                    close: entry.close,
                    volume: entry.volume,
                }));
            } else {
                // If no database data either, throw the original error
                throw yahooErr;
            }
        }

        // Step 7: Check if any data was returned.
        if (!result || result.length === 0) {
            return res.status(404).json({ error: `No data found for the symbol ${ticker}` });
        }

        // Step 8: Sort the results to find the most recent day and return.
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(result);

    } catch (err) {
        console.error('Market OHLC error:', err.message);
        // Handle specific error types
        if (err.message?.includes('Too Many Requests') || err.message?.includes('429')) {
            return res.status(429).json({ message: 'Rate limited. Please try again in a few minutes.' });
        }
        if (err.message?.includes('404 Not Found')) {
            return res.status(404).json({ message: 'Invalid symbol or no data available.' });
        }
        res.status(500).json({ message: 'Server error while fetching market data. Please try again.' });
    }
});


//get data from ohlc model of given symbol
router.get('/data/:symbol', ensureAuth, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { range = '1Y' } = req.query; // Get range from query, default to '1Y'

        const endDate = new Date();
        const startDate = new Date();

        console.log("Fetching OHLC data for:", symbol, "with range:", range);

        // Set the start date based on the requested range
        switch (range) {
            case '5D':
                startDate.setDate(endDate.getDate() - 5);
                break;
            case '1M':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case '3M':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case '6M':
                startDate.setMonth(endDate.getMonth() - 6);
                break;
            case '1Y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                // Fallback for an unknown range, get the last year
                startDate.setFullYear(endDate.getFullYear() - 1);
        }

        // --- FIX: Query the 'timestamp' field instead of 'date' ---
        const data = await OHLC.find({
            symbol: symbol,
            timestamp: { $gte: startDate, $lte: endDate }

        }).sort({ timestamp: 'asc' }); // Also sort by timestamp

        if (!data || data.length === 0) {
            return res.status(404).json([]); // Send empty array if no data
        }

        // Map the data to the expected format. Notice we use entry.timestamp
        const result = data.map(entry => ({
            symbol: entry.symbol,
            date: entry.timestamp, // Keep 'date' here as the frontend expects it
            open: entry.open,
            high: entry.high,
            low: entry.low,
            close: entry.close,
            volume: entry.volume,
        }));
        console.log("OHLC data fetched:", result);
        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching OHLC data.' });
    }
});


export default router;
