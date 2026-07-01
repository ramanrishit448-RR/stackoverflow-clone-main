import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const token = header.split(" ")[1];
    const decodedata = jwt.verify(token, process.env.JWT_SECRET);
    req.userid = decodedata?.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      const decodedata = jwt.verify(token, process.env.JWT_SECRET);
      req.userid = decodedata?.id;
    }
  } catch {
    req.userid = null;
  }
  next();
};

export const adminAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const token = header.split(" ")[1];
    const decodedata = jwt.verify(token, process.env.JWT_SECRET);
    req.userid = decodedata?.id;

    const User = (await import("../models/auth.js")).default;
    const currentUser = await User.findById(req.userid).select("role isSuspended suspendedUntil");
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;
