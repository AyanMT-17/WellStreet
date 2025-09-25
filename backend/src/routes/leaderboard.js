import express from 'express';
import yahooFinance from 'yahoo-finance2';
import User from '../models/User.js';
import Position from '../models/Positions.js';

const router = express.Router();
const STARTING_CASH = 1000000;

router.get('/', async (req, res) => {
    try {
        //fetch all the users and their positions
        const users = await User.find({}, 'name cash');
        const positions = await Position.find({});

        //Group positions by user for easier access
        const positionsByUser = positions.reduce((acc, pos) => {
            const userId = pos.user.toString();
            if (!acc[userId]) {
                acc[userId] = [];
            }
            acc[userId].push(pos);
            return acc;
        }, {});
        
        //Calculate total portfolio value for each user
        const leaderboardData = [];
        for (const user of users) {
            let holdingsValue = 0;
            const userPositions = positionsByUser[user._id.toString()] || [];

            for (const pos of userPositions) {
                try {
                    const quote = await yahooFinance.quote(pos.symbol);
                    holdingsValue += quote.regularMarketPrice * pos.quantity;
                } catch (priceError) {
                    
                    holdingsValue += pos.averagePrice * pos.quantity;
                }
            }
            const totalPortfolioValue = user.cash + holdingsValue;
            const percentageGain = ((totalPortfolioValue - STARTING_CASH) / STARTING_CASH) * 100;

            leaderboardData.push({
                name: user.name,
                portfolioValue: totalPortfolioValue,
                percentageGain: parseFloat(percentageGain.toFixed(2)) // Round to 2 decimal places
            });
    }
    leaderboardData.sort((a, b) => b.percentageGain - a.percentageGain);
    res.json(leaderboardData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching leaderboard.' });
    }
});

export default router;