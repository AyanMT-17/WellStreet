import express from 'express';
import passport from 'passport';
import jwt from "jsonwebtoken";

const router = express.Router();

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback after Google login
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    // Create JWT with user info
    const token = jwt.sign(
      {
        userId: req.user._id,   // MongoDB _id
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: false,           // frontend can read if needed
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Redirect to frontend
    res.redirect("http://localhost:5173/");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  // Clear cookie
  res.clearCookie("token");
  res.json({ success: true });
});

export default router;
