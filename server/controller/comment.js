import mongoose from "mongoose";
import Comment from "../models/comment.js";
import Post from "../models/post.js";
import User from "../models/auth.js";
import { computeEngagementScore, createNotification, parseMentions } from "../utils/feedHelpers.js";

const PAGE_SIZE = 15;

export const getComments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const filter = {
      postId: req.params.postId,
      isRemoved: false,
      parentId: null,
    };

    const [comments, total] = await Promise.all([
      Comment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(PAGE_SIZE).lean(),
      Comment.countDocuments(filter),
    ]);

    const commentIds = comments.map((c) => c._id);
    const replies = await Comment.find({
      parentId: { $in: commentIds },
      isRemoved: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    const uid = req.userid?.toString();
    const formatComment = (c) => ({
      _id: c._id,
      postId: c.postId,
      authorId: c.authorId,
      authorName: c.authorName,
      content: c.content,
      parentId: c.parentId,
      likeCount: c.likes?.length || 0,
      likedByMe: uid ? c.likes?.some((id) => id.toString() === uid) : false,
      createdAt: c.createdAt,
      replies: replies
        .filter((r) => r.parentId?.toString() === c._id.toString())
        .map(formatComment),
    });

    res.status(200).json({
      data: comments.map(formatComment),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        hasMore: skip + comments.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findOne({ _id: req.params.postId, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await User.findById(req.userid).select("name isSuspended suspendedUntil");
    if (
      user?.isSuspended &&
      (!user.suspendedUntil || user.suspendedUntil > new Date())
    ) {
      return res.status(403).json({ message: "Your account is suspended" });
    }

    if (parentId) {
      const parent = await Comment.findOne({ _id: parentId, isRemoved: false });
      if (!parent) return res.status(404).json({ message: "Parent comment not found" });
    }

    const mentionNames = parseMentions(content);
    const mentionedUsers = mentionNames.length
      ? await User.find({ name: { $in: mentionNames } }).select("_id name")
      : [];

    const comment = await Comment.create({
      postId: post._id,
      authorId: req.userid,
      authorName: user.name,
      content: content.trim(),
      parentId: parentId || null,
      mentions: mentionedUsers.map((u) => u._id),
    });

    post.commentCount += 1;
    post.engagementScore = computeEngagementScore(post);
    await post.save();

    const notifType = parentId ? "reply" : "comment";
    const notifMessage = parentId
      ? `${user.name} replied to a comment on your post`
      : `${user.name} commented on your post`;

    await createNotification({
      recipientId: post.authorId,
      actorId: req.userid,
      actorName: user.name,
      type: notifType,
      postId: post._id,
      commentId: comment._id,
      message: notifMessage,
    });

    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (parent && parent.authorId.toString() !== req.userid) {
        await createNotification({
          recipientId: parent.authorId,
          actorId: req.userid,
          actorName: user.name,
          type: "reply",
          postId: post._id,
          commentId: comment._id,
          message: `${user.name} replied to your comment`,
        });
      }
    }

    for (const mentioned of mentionedUsers) {
      await createNotification({
        recipientId: mentioned._id,
        actorId: req.userid,
        actorName: user.name,
        type: "mention",
        postId: post._id,
        commentId: comment._id,
        message: `${user.name} mentioned you in a comment`,
      });
    }

    res.status(201).json({
      data: {
        _id: comment._id,
        authorId: comment.authorId,
        authorName: comment.authorName,
        content: comment.content,
        parentId: comment.parentId,
        likeCount: 0,
        likedByMe: false,
        createdAt: comment.createdAt,
        replies: [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isRemoved: false });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.authorId.toString() !== req.userid) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    comment.content = req.body.content?.trim() || comment.content;
    await comment.save();
    res.status(200).json({ data: comment });
  } catch (error) {
    res.status(500).json({ message: "Failed to update comment" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isRemoved: false });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const user = await User.findById(req.userid).select("role");
    if (comment.authorId.toString() !== req.userid && user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.isRemoved = true;
    await comment.save();

    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

export const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isRemoved: false });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const uid = new mongoose.Types.ObjectId(req.userid);
    const liked = comment.likes.some((id) => id.toString() === req.userid);

    if (liked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== req.userid);
    } else {
      comment.likes.push(uid);
    }

    await comment.save();
    res.status(200).json({
      data: { likeCount: comment.likes.length, likedByMe: !liked },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle comment like" });
  }
};
