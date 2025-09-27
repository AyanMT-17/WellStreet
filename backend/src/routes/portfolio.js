import express from 'express';
import passport from 'passport';
import yahooFinance from 'yahoo-finance2';
import User from '../models/User.js';
import Position from '../models/Positions.js';
import Order from '../models/Order.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

router.get("/", ensureAuth, async (req, res) => {
    try {
      const positions = await Position.find({ user: req.user.id });
      const user = await User.findById(req.user.id).select("cash");
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.json({ positions, cash: user.cash });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while fetching portfolio." });
    }
  });

router.post('/buy', ensureAuth, async (req, res) => {
    const {symbol,quantity} = req.body;
    const userId = req.user.id;

    if(!symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Valid symbol and quantity are required.' });
    }

    try {
        const ticker = `${symbol.toUpperCase()}.NS`;
        const quote = await yahooFinance.quote(ticker);
        const marketPrice = quote.regularMarketPrice;

        if(!marketPrice) {
            return res.status(404).json({ message: 'Could not fetch market price for symbol.' });
        }

        const totalCost = marketPrice * quantity;
        const user = await User.findById(userId);

        if (user.cash < totalCost) {
            return res.status(400).json({ message: 'Insufficient funds.' });
        }

        user.cash -= totalCost;
        await user.save();

        const newOrder = new Order({
            user: userId,
            symbol: ticker,
            side: 'BUY',
            type: 'MARKET',
            quantity,
            price: marketPrice
        });

        await newOrder.save();

        let position = await Position.findOne({ user: userId, symbol: ticker });

        if(position) {
            const newTotalQuantity = position.quantity + quantity;
            const newAveragePrice = ((position.averagePrice * position.quantity) + totalCost) / newTotalQuantity;
            position.quantity = newTotalQuantity;
            position.averagePrice = newAveragePrice;
            await position.save();
        } else {
            position = new Position({
                user: userId,
                symbol: ticker,
                quantity,
                averagePrice: marketPrice
            });
            await position.save();
        }
        res.status(201).json({ message: 'Buy order executed successfully.', order: newOrder, position });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while processing buy order.' });
    }
});

router.post('/sell', ensureAuth, async (req, res) => {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if(!symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Valid symbol and quantity are required.' });
    }
    try{
        const ticker = `${symbol.toUpperCase()}.NS`;

        const position = await Position.findOne({ user: userId, symbol: ticker });

        if (!position) {
            return res.status(404).json({ message: 'Position not found. You do not own this stock.' });
        }

        if (position.quantity < quantity) {
            return res.status(400).json({ message: `Insufficient shares. You only own ${position.quantity}.` });
        }

        const quote = await yahooFinance.quote(ticker);
        const marketPrice = quote.regularMarketPrice;
        if (!marketPrice) {
            return res.status(404).json({ message: 'Could not fetch market price for symbol.' });
        }

        const totalProceeds = marketPrice * quantity;
        const user = await User.findById(userId);
        user.cash += totalProceeds; // Add proceeds to user's cash
        await user.save();

        const newOrder = new Order({
            user: userId,
            symbol: ticker,
            side: 'SELL',
            type: 'MARKET',
            quantity,
            price: marketPrice,
        });
        await newOrder.save();

        position.quantity -= quantity;
        if (position.quantity === 0) {
            // If all shares are sold, remove the position
            await Position.findByIdAndDelete(position._id);
        } else {
            // Otherwise, just save the updated quantity
            await position.save();
        }

        res.status(200).json({ message: 'Sell order executed successfully.', order: newOrder });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while processing sell order.' });
    }
});


export default router;
