import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

async function finnhubRequest(endpoint, params = {}) {
    if (!API_KEY) throw new Error("FINNHUB_API_KEY is missing in .env");
    
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('token', API_KEY);
    Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));

    const response = await fetch(url.toString());
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Finnhub Error: ${response.status} - ${err}`);
    }
    return response.json();
}

export const finnhubService = {
    // Real-time Quote
    async getQuote(symbol) {
        const data = await finnhubRequest('/quote', { symbol: symbol.toUpperCase() });
        return {
            symbol: symbol.toUpperCase(),
            price: data.c, // Current price
            change: data.d,
            percentChange: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            prevClose: data.pc
        };
    },

    // Company Profile
    async getProfile(symbol) {
        return await finnhubRequest('/stock/profile2', { symbol: symbol.toUpperCase() });
    },

    // Institutional News for AI Analysis
    async getNews(symbol) {
        const today = new Date().toISOString().split('T')[0];
        // Increased to 30 days for better coverage on 100+ stocks
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        return await finnhubRequest('/company-news', { 
            symbol: symbol.toUpperCase(),
            from: lastMonth,
            to: today
        });
    },

    // Market News (General)
    async getGeneralNews() {
        return await finnhubRequest('/news', { category: 'general' });
    },

    // Search Symbols
    async search(query) {
        return await finnhubRequest('/search', { q: query.toUpperCase() });
    },

    // Insider Sentiment
    async getInsiderSentiment(symbol) {
        const today = new Date().toISOString().split('T')[0];
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return await finnhubRequest('/stock/insider-sentiment', { 
            symbol: symbol.toUpperCase(),
            from: sixMonthsAgo,
            to: today
        });
    },

    // Basic Financials (Margin, ROE, etc.)
    async getBasicFinancials(symbol) {
        return await finnhubRequest('/stock/metric', { 
            symbol: symbol.toUpperCase(),
            metric: 'all'
        });
    }
};
