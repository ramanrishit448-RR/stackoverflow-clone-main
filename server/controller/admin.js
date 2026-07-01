import mongoose from "mongoose";
import Post from "../models/post.js";
import Report from "../models/report.js";
import User from "../models/auth.js";

export const getReports = async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const reports = await Report.find({ status })
      .sort({ createdAt: -1 })
      .populate("postId", "content authorName authorId isRemoved")
      .populate("reporterId", "name email")
      .lean();

    res.status(200).json({ data: reports });
  } catch (error) {
    res.status(500).json({ message: "Failed to load reports" });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const { status, adminNote, removePost, suspendUser, suspendDays } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status || "reviewed";
    report.adminNote = adminNote;
    report.reviewedBy = req.userid;
    await report.save();

    if (removePost) {
      await Post.findByIdAndUpdate(report.postId, {
        isRemoved: true,
        removedReason: adminNote || "Removed by admin",
      });
    }

    if (suspendUser) {
      const post = await Post.findById(report.postId);
      if (post) {
        const offender = await User.findById(post.authorId);
        if (offender) {
          offender.violationCount += 1;
          if (offender.violationCount >= 2 || suspendDays) {
            offender.isSuspended = true;
            offender.suspendedUntil = suspendDays
              ? new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000)
              : null;
          }
          await offender.save();
        }
      }
    }

    res.status(200).json({ data: report, message: "Report reviewed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to review report" });
  }
};

export const removePostAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isRemoved: true, removedReason: req.body.reason || "Removed by admin" },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove post" });
  }
};

export const suspendUserAdmin = async (req, res) => {
  try {
    const { days } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = true;
    user.violationCount += 1;
    user.suspendedUntil = days
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;
    await user.save();

    res.status(200).json({ message: "User suspended", data: user });
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend user" });
  }
};

export const promoteAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ data: user, message: "User promoted to admin" });
  } catch (error) {
    res.status(500).json({ message: "Failed to promote user" });
  }
};
