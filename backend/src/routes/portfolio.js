import express from 'express';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

// Repurposed Portfolio route - now just returns an empty list or tracked assets
router.get("/", ensureAuth, async (req, res) => {
    try {
        // In the new terminal, we don't have "positions"
        res.json({ positions: [], cash: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
