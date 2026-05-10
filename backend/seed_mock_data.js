import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OHLC from './src/models/OHLC.js';
import connectDB from './src/config/db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const TOP_STOCKS = [
    { s: 'AAPL', p: 185 }, { s: 'MSFT', p: 415 }, { s: 'GOOGL', p: 150 }, 
    { s: 'AMZN', p: 175 }, { s: 'META', p: 490 }, { s: 'TSLA', p: 170 }, 
    { s: 'NVDA', p: 880 }, { s: 'BRK-B', p: 405 }, { s: 'JPM', p: 195 }, 
    { s: 'V', p: 280 }, { s: 'SPY', p: 510 }, { s: 'QQQ', p: 440 },
    { s: 'UNH', p: 480 }, { s: 'JNJ', p: 155 }, { s: 'XOM', p: 115 },
    { s: 'MA', p: 450 }, { s: 'PG', p: 160 }, { s: 'AVGO', p: 1300 },
    { s: 'HD', p: 350 }, { s: 'CVX', p: 150 }, { s: 'MRK', p: 125 },
    { s: 'ABBV', p: 175 }, { s: 'COST', p: 720 }, { s: 'PEP', p: 170 },
    { s: 'KO', p: 60 }, { s: 'TMO', p: 550 }, { s: 'WMT', p: 60 },
    { s: 'MCD', p: 290 }, { s: 'PFE', p: 27 }, { s: 'BAC', p: 35 },
    { s: 'CRM', p: 300 }, { s: 'ADBE', p: 550 }, { s: 'LIN', p: 450 },
    { s: 'ACN', p: 330 }, { s: 'CSCO', p: 50 }, { s: 'ABT', p: 110 },
    { s: 'ORCL', p: 125 }, { s: 'DIS', p: 115 }, { s: 'AMD', p: 180 },
    { s: 'TXN', p: 170 }, { s: 'PM', p: 90 }, { s: 'VZ', p: 40 },
    { s: 'NEE', p: 65 }, { s: 'AMGN', p: 280 }, { s: 'NKE', p: 100 },
    { s: 'HON', p: 200 }, { s: 'IBM', p: 190 }, { s: 'RTX', p: 90 },
    { s: 'UPS', p: 145 }, { s: 'MS', p: 85 }, { s: 'LOW', p: 240 },
    { s: 'BMY', p: 50 }, { s: 'INTC', p: 45 }, { s: 'QCOM', p: 170 },
    { s: 'CAT', p: 330 }, { s: 'GE', p: 160 }, { s: 'INTU', p: 630 },
    { s: 'DE', p: 380 }, { s: 'CVS', p: 75 }, { s: 'SPGI', p: 430 },
    { s: 'PLD', p: 130 }, { s: 'GS', p: 390 }, { s: 'ISRG', p: 390 },
    { s: 'AMT', p: 190 }, { s: 'BKNG', p: 3500 }, { s: 'AMAT', p: 200 },
    { s: 'BLK', p: 800 }, { s: 'MDT', p: 85 }, { s: 'TJX', p: 100 },
    { s: 'ADI', p: 190 }, { s: 'MDLZ', p: 70 }, { s: 'SYK', p: 350 },
    { s: 'ADP', p: 250 }, { s: 'MMC', p: 200 }, { s: 'VRTX', p: 420 },
    { s: 'REGN', p: 950 }, { s: 'ZTS', p: 180 }, { s: 'LLY', p: 750 },
    { s: 'MO', p: 40 }, { s: 'LMT', p: 450 }, { s: 'CB', p: 250 },
    { s: 'GILD', p: 75 }, { s: 'CI', p: 340 }, { s: 'T', p: 17 },
    { s: 'ELV', p: 500 }, { s: 'BAX', p: 40 }, { s: 'BSX', p: 65 },
    { s: 'MU', p: 100 }, { s: 'NOW', p: 750 }, { s: 'LRCX', p: 900 },
    { s: 'FISV', p: 150 }, { s: 'PANW', p: 280 }, { s: 'SNPS', p: 550 },
    { s: 'CDNS', p: 300 }, { s: 'KLAC', p: 650 }, { s: 'APH', p: 110 },
    { s: 'EQIX', p: 800 }, { s: 'SHW', p: 320 }, { s: 'PGR', p: 200 }
];

const seedMockData = async () => {
    console.log('🧪 Seeding 100+ Asset Institutional Terminal Data...');
    await connectDB();

    const now = new Date();
    
    for (const { s: symbol, p: basePrice } of TOP_STOCKS) {
        process.stdout.write(`Generating data for ${symbol}... `);
        const entries = [];
        
        for (let i = 300; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const change = (Math.random() - 0.45) * (basePrice * 0.02); 
            const open = basePrice + change;
            const close = open + (Math.random() - 0.5) * (basePrice * 0.01);
            
            entries.push({
                symbol,
                timestamp: date,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat((Math.max(open, close) + Math.random()).toFixed(2)),
                low: parseFloat((Math.min(open, close) - Math.random()).toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: Math.floor(Math.random() * 10000000)
            });
        }

        await OHLC.deleteMany({ symbol });
        await OHLC.insertMany(entries);
        console.log('✅');
    }

    console.log('✅ Institutional Core expanded to 100+ assets.');
    process.exit(0);
};

seedMockData();
