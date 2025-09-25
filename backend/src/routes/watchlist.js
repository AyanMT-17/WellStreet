import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import User from "../models/User.js";
import { ensureAuth } from "../middleware/auth.js";

const router = express.Router();
dotenv.config();

router.get("/", ensureAuth, async (req, res) => {
    try {
        res.json({ watchlist: req.user.watchlist });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching watchlist.' });
    }
});

router.post("/", ensureAuth, async (req, res) => {
    try {
        const { symbol } = req.body;
        if(!symbol) {
            return res.status(400).json({ message: 'Symbol is required.' });
        }

        const ticker = symbol.toUpperCase().endsWith('.NS') ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { watchlist: ticker } },
            { new: true }
        );

        res.json(updatedUser.watchlist);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while adding to watchlist.' });
    }
});


router.delete("/:symbol", ensureAuth, async (req, res) =>{
    try {
        const { symbol } = req.params;
        const ticker = symbol.toUpperCase().endsWith('.NS') ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { watchlist: ticker } },
            { new: true }
        );

        res.json(updatedUser.watchlist);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while removing from watchlist.' });
    }
});

export default router;