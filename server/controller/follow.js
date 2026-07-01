import mongoose from "mongoose";
import User from "../models/auth.js";
import { createNotification } from "../utils/feedHelpers.js";

export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (targetId === req.userid) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userid),
      User.findById(targetId),
    ]);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetId
    );
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    currentUser.following.push(targetId);
    targetUser.followers.push(req.userid);
    await Promise.all([currentUser.save(), targetUser.save()]);

    await createNotification({
      recipientId: targetId,
      actorId: req.userid,
      actorName: currentUser.name,
      type: "follow",
      message: `${currentUser.name} started following you`,
    });

    res.status(200).json({
      data: {
        following: true,
        followerCount: targetUser.followers.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to follow user" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userid),
      User.findById(targetId),
    ]);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.userid
    );
    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({
      data: {
        following: false,
        followerCount: targetUser.followers.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to unfollow user" });
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select("followers following");
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const following = req.userid
      ? targetUser.followers.some((id) => id.toString() === req.userid)
      : false;

    res.status(200).json({
      data: {
        following,
        followerCount: targetUser.followers.length,
        followingCount: targetUser.following.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get follow status" });
  }
};
