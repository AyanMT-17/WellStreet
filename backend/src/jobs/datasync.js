// In jobs/dataSync.js
import cron from 'node-cron';
import yahooFinance from 'yahoo-finance2';
import OHLC from '../models/OHLC.js';

// A list of important NIFTY 50 stocks to track
const SYMBOLS_TO_TRACK = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'INFY.NS',
    'BHARTIARTL.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'ITC.NS', 'LT.NS',
    'BAJFINANCE.NS', 'HCLTECH.NS', 'KOTAKBANK.NS', 'AXISBANK.NS', 'MARUTI.NS',
    'ASIANPAINT.NS', 'TATASTEEL.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'ULTRACEMCO.NS',
    'WIPRO.NS', 'TATAMOTORS.NS', 'ADANIENT.NS', 'NESTLEIND.NS', 'M&M.NS',
    'POWERGRID.NS', 'BAJAJFINSV.NS', 'NTPC.NS', 'JSWSTEEL.NS', 'LTIM.NS',
    'HDFCLIFE.NS', 'DRREDDY.NS', 'ADANIPORTS.NS', 'HINDALCO.NS', 'TATACONSUM.NS',
    'CIPLA.NS', 'GRASIM.NS', 'COALINDIA.NS', 'INDUSINDBK.NS', 'BRITANNIA.NS',
    'EICHERMOT.NS', 'SBILIFE.NS', 'HEROMOTOCO.NS', 'DIVISLAB.NS', 'ONGC.NS',
    'APOLLOHOSP.NS', 'TECHM.NS', 'BPCL.NS', 'SHRIRAMFIN.NS', 'BAJAJ-AUTO.NS'
];

const syncMarketData = async () => {
    console.log('🗓️ Starting daily market data sync...');
    
    for (const symbol of SYMBOLS_TO_TRACK) {
        try {
            const result = await yahooFinance.historical(symbol, {
                period1: '2023-01-01', // Fetch data from a fixed start date
                interval: '1d'
            });

            for (const bar of result) {
                // 'Upsert' operation: Update if exists, insert if not.
                // This prevents duplicate entries.
                await OHLC.updateOne(
                    { symbol: symbol},
                    {
                        $set: {
                            timestamp: bar.date,
                            open: bar.open,
                            high: bar.high,
                            low: bar.low,
                            close: bar.close,
                            volume: bar.volume
                        }
                    },
                    { upsert: true }
                );
            }
            console.log(`✅ Synced data for ${symbol}`);
        } catch (err) {
            console.error(`❌ Failed to sync data for ${symbol}:`, err.message);
        }
    }
    console.log('Market data sync finished.');
};

// Schedule the job to run at 5:12 AM every day (IST)
// Cron syntax: 'minute hour day-of-month month day-of-week'
const scheduleDataSync = () => {
    // Correct cron schedule for 5:10 AM
 cron.schedule('30 6 * * *', syncMarketData, {
 timezone: "Asia/Kolkata"
 });
 // Updated the log message to match the new time
 console.log('Scheduler started. Data sync will run daily at 6:30 AM IST.');
};

export default scheduleDataSync;