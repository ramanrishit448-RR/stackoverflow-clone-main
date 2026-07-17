import jwt from "jsonwebtoken";
import Session from "../models/session.js";

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const token = header.split(" ")[1];
    const decodedata = jwt.verify(token, process.env.JWT_SECRET || "stackoverflow_clone_dev_secret");
    req.userid = decodedata?.id;

    const session = await Session.findOne({ token, userId: req.userid });
    if (!session) {
      return res.status(401).json({ message: "Session expired or revoked" });
    }

    if (!session.isVerified) {
      return res.status(401).json({ message: "Device verification required" });
    }

    const timeout = parseInt(process.env.SESSION_INACTIVE_TIMEOUT) || 24 * 60 * 60 * 1000;
    if (Date.now() - session.lastActive.getTime() > timeout) {
      await session.deleteOne();
      return res.status(401).json({ message: "Session expired due to inactivity" });
    }

    session.lastActive = new Date();
    await session.save();

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      const decodedata = jwt.verify(token, process.env.JWT_SECRET || "stackoverflow_clone_dev_secret");
      
      const session = await Session.findOne({ token, userId: decodedata?.id });
      if (session && session.isVerified) {
        const timeout = parseInt(process.env.SESSION_INACTIVE_TIMEOUT) || 24 * 60 * 60 * 1000;
        if (Date.now() - session.lastActive.getTime() <= timeout) {
          req.userid = decodedata?.id;
          session.lastActive = new Date();
          await session.save();
        }
      }
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
    const decodedata = jwt.verify(token, process.env.JWT_SECRET || "stackoverflow_clone_dev_secret");
    req.userid = decodedata?.id;

    const session = await Session.findOne({ token, userId: req.userid });
    if (!session || !session.isVerified) {
      return res.status(401).json({ message: "Session expired, revoked or unverified" });
    }

    const timeout = parseInt(process.env.SESSION_INACTIVE_TIMEOUT) || 24 * 60 * 60 * 1000;
    if (Date.now() - session.lastActive.getTime() > timeout) {
      await session.deleteOne();
      return res.status(401).json({ message: "Session expired due to inactivity" });
    }

    session.lastActive = new Date();
    await session.save();

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
