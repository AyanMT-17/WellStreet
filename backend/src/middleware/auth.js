import jwt from "jsonwebtoken";

export function ensureAuth(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Map userId from JWT to req.user.id
    req.user = {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.avatar,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}
