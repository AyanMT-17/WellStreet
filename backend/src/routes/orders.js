import express from 'express';
import passport from 'passport';
import Order from '../models/Order.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', ensureAuth, async (req, res) => {
    try{
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    }catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching orders.' });
    }
});

export default router;