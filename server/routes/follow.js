import express from "express";
import auth, { optionalAuth } from "../middleware/auth.js";
import { followUser, getFollowStatus, unfollowUser } from "../controller/follow.js";

const router = express.Router();

router.get("/:id/follow-status", optionalAuth, getFollowStatus);
router.post("/:id/follow", auth, followUser);
router.delete("/:id/follow", auth, unfollowUser);

export default router;
