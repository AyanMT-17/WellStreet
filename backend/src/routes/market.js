import express from "express";
import passport from "passport";
import yahooFinance from "yahoo-finance2";
import { ensureAuth } from "../middleware/auth.js";
import getGroqChatCompletion from "../services/groqser.js";
const router = express.Router();

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
        let ticker = tickerFromGroq.trim().toUpperCase();
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

        // Step 6: Fetch the historical data.
        const result = await yahooFinance.historical(ticker, queryOptions);

        // Step 7: Check if any data was returned.
        if (!result || result.length === 0) {
            return res.status(404).json({ error: `No data found for the symbol ${ticker}` });
        }

        // Step 8: Sort the results to find the most recent day and return only that object.
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(result[0]);

    } catch (err) {
        console.error(err);
        // The existing error handling is good, so we'll keep it.
        if (err.message.includes('404 Not Found')) {
            return res.status(404).json({ message: 'Invalid symbol or no data available.' });
        }
        res.status(500).json({ message: 'Server error while fetching market data.' });
    }
});

export default router;
