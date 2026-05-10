// In jobs/dataSync.js
import cron from 'node-cron';
import { yahooService } from '../services/yahooFinanceService.js';
import OHLC from '../models/OHLC.js';

// A list of important US stocks to track (Top ~100)
const SYMBOLS_TO_TRACK = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'BRK-B', 'JPM', 'V',
    'UNH', 'JNJ', 'XOM', 'MA', 'PG', 'AVGO', 'HD', 'CVX', 'MRK', 'ABBV',
    'COST', 'PEP', 'KO', 'TMO', 'WMT', 'MCD', 'PFE', 'BAC', 'CRM', 'ADBE',
    'LIN', 'ACN', 'CSCO', 'ABT', 'ORCL', 'DIS', 'AMD', 'TXN', 'PM', 'VZ',
    'NEE', 'AMGN', 'NKE', 'HON', 'IBM', 'RTX', 'UPS', 'MS', 'LOW', 'BMY',
    'INTC', 'QCOM', 'CAT', 'GE', 'INTU', 'DE', 'CVS', 'SPGI', 'PLD', 'GS',
    'ISRG', 'AMT', 'BKNG', 'AMAT', 'BLK', 'MDT', 'TJX', 'ADI', 'MDLZ', 'SYK',
    'ADP', 'MMC', 'VRTX', 'REGN', 'ZTS', 'LLY', 'MO', 'LMT', 'CB', 'GILD',
    'CI', 'T', 'ELV', 'BAX', 'BSX', 'MU', 'NOW', 'LRCX', 'FISV', 'PANW',
    'SNPS', 'CDNS', 'KLAC', 'APH', 'EQIX', 'SHW', 'PGR'
];

const syncMarketData = async () => {
    console.log('🗓️ Starting daily market data sync...');
    
    for (const symbol of SYMBOLS_TO_TRACK) {
        try {
            const result = await yahooService.getHistorical(symbol, {
                period1: '2023-01-01', // Fetch data from a fixed start date
                interval: '1d'
            });

            for (const bar of result) {
                // 'Upsert' operation: Update if exists, insert if not.
                // This prevents duplicate entries.
                await OHLC.updateOne(
                    { symbol, timestamp: bar.date },
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
