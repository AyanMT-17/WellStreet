import yahooFinance from "yahoo-finance2";
import OHLC from "../models/OHLC.js";

yahooFinance.suppressNotices(["ripHistorical", "yahooSurvey"]);

const cache = new Map();
const inflight = new Map();

const CACHE_TTL = 5 * 60 * 1000;
const QUOTE_TTL = 30 * 1000;
const STALE_TTL = 15 * 60 * 1000;
const MIN_DELAY = 3500; // Increased delay
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minute cooldown
const RETRY_DELAYS_MS = [0, 5000, 15000];

let queue = Promise.resolve();
let rateLimitedUntil = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getCached(cacheKey, maxAge) {
    const cached = cache.get(cacheKey);
    if (!cached) return null;
    if ((Date.now() - cached.timestamp) >= maxAge) return null;
    return cached.data;
}

function getStale(cacheKey) {
    return getCached(cacheKey, STALE_TTL);
}

function setCached(cacheKey, data) {
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

function isRateLimitError(err) {
    const message = String(err?.message || "");
    // Catch formal 429s AND the parsing errors caused by HTML rate limit pages
    return (
        message.includes("Too Many Requests") || 
        message.includes("429") || 
        message.includes("Unexpected token") || 
        message.includes("is not valid JSON")
    );
}

function markRateLimited() {
    rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
}

function isInRateLimitCooldown() {
    return Date.now() < rateLimitedUntil;
}

async function addToQueue(task) {
    const result = queue.then(async () => {
        const waitMs = Math.max(0, rateLimitedUntil - Date.now());
        if (waitMs > 0) {
            await sleep(waitMs);
        }

        await sleep(MIN_DELAY);
        return task();
    });

    queue = result.catch(() => {});
    return result;
}

async function runShared(cacheKey, executor) {
    if (inflight.has(cacheKey)) {
        return inflight.get(cacheKey);
    }

    const pending = addToQueue(executor).finally(() => {
        inflight.delete(cacheKey);
    });

    inflight.set(cacheKey, pending);
    return pending;
}

async function getLatestQuoteFromDb(ticker) {
    const latestEntry = await OHLC.findOne({ symbol: ticker }).sort({ timestamp: -1 });
    if (!latestEntry) return null;

    return {
        symbol: ticker,
        regularMarketPrice: latestEntry.close,
        regularMarketOpen: latestEntry.open,
        regularMarketDayHigh: latestEntry.high,
        regularMarketDayLow: latestEntry.low,
        regularMarketVolume: latestEntry.volume,
        regularMarketTime: latestEntry.timestamp,
        source: "ohlc-fallback",
    };
}

async function executeWithRetry(label, requestFn) {
    if (isInRateLimitCooldown()) {
        throw new Error("Yahoo Finance temporarily rate-limited");
    }

    let lastError;

    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
        try {
            if (RETRY_DELAYS_MS[attempt] > 0) {
                await sleep(RETRY_DELAYS_MS[attempt]);
            }
            return await requestFn();
        } catch (err) {
            lastError = err;
            if (!isRateLimitError(err)) {
                throw err;
            }
            markRateLimited();
        }
    }

    throw lastError;
}

export const yahooService = {
    async getHistorical(ticker, options) {
        const cacheKey = `hist-${ticker}-${JSON.stringify(options)}`;
        const cached = getCached(cacheKey, CACHE_TTL);
        if (cached) {
            return cached;
        }

        const stale = getStale(cacheKey);

        try {
            return await runShared(cacheKey, async () => {
                const chartResult = await executeWithRetry(
                    `Yahoo Finance Historical error for ${ticker}`,
                    () => yahooFinance.chart(ticker, options)
                );

                const quotes = (chartResult?.quotes || [])
                    .filter((entry) => entry?.date)
                    .map((entry) => ({
                        date: entry.date,
                        open: entry.open,
                        high: entry.high,
                        low: entry.low,
                        close: entry.close,
                        volume: entry.volume,
                    }));

                return setCached(cacheKey, quotes);
            });
        } catch (err) {
            if (!String(err.message || "").includes("temporarily rate-limited")) {
                console.error(`Yahoo Finance Historical error for ${ticker}:`, err.message);
            }
            if (stale) {
                return stale;
            }
            throw err;
        }
    },

    async getQuote(ticker) {
        const cacheKey = `quote-${ticker}`;
        const cached = getCached(cacheKey, QUOTE_TTL);
        if (cached) {
            return cached;
        }

        const stale = getStale(cacheKey);
        const dbFallback = await getLatestQuoteFromDb(ticker);

        if (dbFallback) {
            setCached(cacheKey, dbFallback);
            return dbFallback;
        }

        try {
            return await runShared(cacheKey, async () => {
                const result = await executeWithRetry(
                    `Yahoo Finance Quote error for ${ticker}`,
                    () => yahooFinance.quote(ticker)
                );
                return setCached(cacheKey, result);
            });
        } catch (err) {
            if (!String(err.message || "").includes("temporarily rate-limited")) {
                console.error(`Yahoo Finance Quote error for ${ticker}:`, err.message);
            }

            if (stale) {
                return stale;
            }

            throw err;
        }
    },

    async getSummary(ticker, options) {
        const cacheKey = `summary-${ticker}-${JSON.stringify(options)}`;
        const cached = getCached(cacheKey, CACHE_TTL);
        if (cached) {
            return cached;
        }

        const stale = getStale(cacheKey);

        try {
            return await runShared(cacheKey, async () => {
                const result = await executeWithRetry(
                    `Yahoo Finance Summary error for ${ticker}`,
                    () => yahooFinance.quoteSummary(ticker, options)
                );
                return setCached(cacheKey, result);
            });
        } catch (err) {
            if (!String(err.message || "").includes("temporarily rate-limited")) {
                console.error(`Yahoo Finance Summary error for ${ticker}:`, err.message);
            }
            if (stale) {
                return stale;
            }
            throw err;
        }
    },

    async search(query) {
        const cacheKey = `search-${query}`;
        const cached = getCached(cacheKey, CACHE_TTL);
        if (cached) {
            return cached;
        }

        const stale = getStale(cacheKey);

        try {
            return await runShared(cacheKey, async () => {
                const result = await executeWithRetry(
                    `Yahoo Finance Search error for ${query}`,
                    () => yahooFinance.search(query)
                );
                return setCached(cacheKey, result);
            });
        } catch (err) {
            if (!String(err.message || "").includes("temporarily rate-limited")) {
                console.error(`Yahoo Finance Search error for ${query}:`, err.message);
            }
            if (stale) {
                return stale;
            }
            throw err;
        }
    }
};
