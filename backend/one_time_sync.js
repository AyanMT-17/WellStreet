import mongoose from 'mongoose';
import { yahooService } from './src/services/yahooFinanceService.js';
import OHLC from './src/models/OHLC.js';
import connectDB from './src/config/db.js';

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
    console.log('🗓️ Starting one-time market data sync for fallback...');
    await connectDB();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 days of data

    for (const symbol of SYMBOLS_TO_TRACK) {
        let success = false;
        let attempts = 0;

        while (!success && attempts < 3) {
            try {
                process.stdout.write(`Syncing ${symbol}... `);
                const result = await yahooService.getHistorical(symbol, {
                    period1: startDate,
                    interval: '1d'
                });

                if (result && result.length > 0) {
                    for (const bar of result) {
                        await OHLC.updateOne(
                            { symbol: symbol, timestamp: bar.date },
                            {
                                $set: {
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
                    console.log('✅');
                    success = true;
                } else {
                    console.log('⚠️ No data');
                    success = true; // Move on
                }
                
                // Mandatory 10 second gap between stocks
                await new Promise(r => setTimeout(r, 10000));

            } catch (err) {
                const isRateLimit = err.message.includes('rate-limited') || 
                                   err.message.includes('Unexpected token') || 
                                   err.message.includes('429');
                
                if (isRateLimit) {
                    console.log('\n🛑 Yahoo is blocking us. Sleeping for 2 minutes...');
                    await new Promise(r => setTimeout(r, 120000)); // 2 min sleep
                    attempts++;
                } else {
                    console.error(`\n❌ Error for ${symbol}:`, err.message);
                    break; 
                }
            }
        }
    }
    console.log('Market data sync finished.');
    process.exit(0);
};

syncMarketData();
