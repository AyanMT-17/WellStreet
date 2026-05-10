/**
 * Technical Indicator Math Library
 */

/**
 * Calculates the Relative Strength Index (RSI)
 * @param {Array} data - Array of OHLC objects
 * @param {number} periods - Period for RSI calculation (standard is 14)
 */
export function calculateRSI(data, periods = 14) {
    if (!data || data.length < periods + 1) return null;

    let gains = 0;
    let losses = 0;

    // Initial average gain/loss
    for (let i = 1; i <= periods; i++) {
        const difference = data[i].close - data[i - 1].close;
        if (difference >= 0) gains += difference;
        else losses -= difference;
    }

    let avgGain = gains / periods;
    let avgLoss = losses / periods;

    // Smoothed RSI calculation for remaining data
    for (let i = periods + 1; i < data.length; i++) {
        const difference = data[i].close - data[i - 1].close;
        const currentGain = difference >= 0 ? difference : 0;
        const currentLoss = difference < 0 ? -difference : 0;

        avgGain = (avgGain * (periods - 1) + currentGain) / periods;
        avgLoss = (avgLoss * (periods - 1) + currentLoss) / periods;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
}

/**
 * Calculates Simple Moving Average (SMA)
 * @param {Array} data - Array of OHLC objects
 * @param {number} periods - Period for SMA
 */
export function calculateSMA(data, periods) {
    if (!data || data.length < periods) return null;
    
    // Take the last N periods
    const slice = data.slice(-periods);
    const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
    return parseFloat((sum / periods).toFixed(2));
}

/**
 * Maps moving averages across the whole dataset for charting
 */
export function mapSMAHistory(data, periods) {
    if (!data || data.length < periods) return [];
    
    return data.map((entry, index) => {
        // Handle Mongoose documents by ensuring we work with plain objects
        const rawEntry = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
        
        if (index < periods - 1) return { ...rawEntry, [`sma${periods}`]: null };
        
        const slice = data.slice(index - periods + 1, index + 1);
        const sum = slice.reduce((acc, curr) => acc + (curr.close || 0), 0);
        return {
            ...rawEntry,
            [`sma${periods}`]: parseFloat((sum / periods).toFixed(2))
        };
    });
}
