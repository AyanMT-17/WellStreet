import { WebSocketServer } from 'ws';
import { finnhubService } from "./finnhubService.js";

const clients = new Map();
const symbolCache = new Map();

let isUpdating = false;
async function updateRealPrices() {
  if (isUpdating) return;
  isUpdating = true;
  
  try {
    const activeSubscriptions = new Set();
    clients.forEach(client => {
      client.subscriptions.forEach(sub => activeSubscriptions.add(sub));
    });

    if (activeSubscriptions.size === 0) return;

    const symbolsArray = Array.from(activeSubscriptions);
    for (const symbol of symbolsArray) {
      try {
        const quote = await finnhubService.getQuote(symbol);
        if (quote && quote.price) {
          const prevPrice = symbolCache.get(symbol.toUpperCase());
          if (prevPrice) {
            const delta = Math.abs((quote.price - prevPrice) / prevPrice);
            if (delta > 0.02) { // 2% volatility threshold
              broadcastVolatilityAlert(symbol.toUpperCase(), quote.price, (quote.price - prevPrice) / prevPrice);
            }
          }
          symbolCache.set(symbol.toUpperCase(), quote.price);
        }
      } catch (err) {
        console.error(`WebSocket price update failed for ${symbol}:`, err.message);
      }
    }
  } finally {
    isUpdating = false;
  }
}

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    const clientId = Date.now();
    clients.set(clientId, { connection: ws, subscriptions: new Set(), userId: null });

    ws.on('message', (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage);
        const clientData = clients.get(clientId);

        if (message.action === 'auth' && message.userId) {
          clientData.userId = message.userId;
        } else if (message.action === 'subscribe' && Array.isArray(message.symbols)) {
          message.symbols.forEach(symbol => clientData.subscriptions.add(symbol.toUpperCase()));
          updateRealPrices();
        } else if (message.action === 'unsubscribe' && Array.isArray(message.symbols)) {
          message.symbols.forEach(symbol => clientData.subscriptions.delete(symbol.toUpperCase()));
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => clients.delete(clientId));
  });

  setInterval(broadcastPrices, 2000);
  setInterval(updateRealPrices, 300000); // 5 mins
}

function broadcastPrices() {
  const updates = [];
  symbolCache.forEach((basePrice, symbol) => {
    const fluctuation = (Math.random() - 0.5) * 0.001;
    const newPrice = basePrice * (1 + fluctuation);
    const formattedSymbol = symbol.toUpperCase();
    updates.push({ symbol: formattedSymbol, price: parseFloat(newPrice.toFixed(2)), timestamp: Date.now() });
  });

  if (updates.length === 0) return;
  const payload = JSON.stringify({ event: 'price-update', ticks: updates });
  clients.forEach(client => {
    if (client.connection.readyState === 1) client.connection.send(payload);
  });
}

function broadcastVolatilityAlert(symbol, price, change) {
  const message = `VOLATILITY ALERT: ${symbol} moved ${(change * 100).toFixed(2)}% to $${price.toFixed(2)}`;
  const payload = JSON.stringify({ 
    event: 'volatility-alert', 
    symbol, 
    price, 
    change,
    message 
  });
  
  clients.forEach(client => {
    if (client.connection.readyState === 1) {
      client.connection.send(payload);
    }
  });
}

export function notifyUser(userId, event, data) {
  const payload = JSON.stringify({ event, ...data });
  clients.forEach(client => {
    if (client.userId === userId && client.connection.readyState === 1) {
      client.connection.send(payload);
    }
  });
}