import mongoose from "mongoose";
import Post from "../models/post.js";
import User from "../models/auth.js";
import Report from "../models/report.js";
import {
  computeEngagementScore,
  createNotification,
  extractHashtags,
  formatPost,
} from "../utils/feedHelpers.js";

const PAGE_SIZE = 10;

const ensureActiveUser = async (userId) => {
  const user = await User.findById(userId).select("isSuspended suspendedUntil name");
  if (!user) return { error: "User not found", status: 404 };
  if (
    user.isSuspended &&
    (!user.suspendedUntil || user.suspendedUntil > new Date())
  ) {
    return { error: "Your account is suspended", status: 403 };
  }
  return { user };
};

export const createPost = async (req, res) => {
  try {
    const check = await ensureActiveUser(req.userid);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const {
      content,
      type = "update",
      codeSnippet,
      codeLanguage,
      projectUrl,
      projectTitle,
      images = [],
    } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const hashtags = [
      ...new Set([
        ...extractHashtags(content),
        ...(req.body.hashtags || []).map((t) => t.replace(/^#/, "").toLowerCase()),
      ]),
    ];

    const post = await Post.create({
      authorId: req.userid,
      authorName: check.user.name,
      type,
      content: content.trim(),
      codeSnippet,
      codeLanguage,
      projectUrl,
      projectTitle,
      images,
      hashtags,
      engagementScore: 0,
    });

    res.status(201).json({ data: formatPost(post, req.userid) });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const mode = req.query.mode || "all";
    const skip = (page - 1) * PAGE_SIZE;

    let filter = { isRemoved: false };

    if (req.query.authorId) {
      filter.authorId = req.query.authorId;
    } else if (mode === "following" && req.userid) {
      const user = await User.findById(req.userid).select("following");
      const followingIds = user?.following || [];
      filter.authorId = { $in: [...followingIds, req.userid] };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      data: posts.map((p) => formatPost(p, req.userid)),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load feed" });
  }
};

export const getTrending = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const [posts, total] = await Promise.all([
      Post.find({ isRemoved: false })
        .sort({ engagementScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Post.countDocuments({ isRemoved: false }),
    ]);

    res.status(200).json({
      data: posts.map((p) => formatPost(p, req.userid)),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load trending posts" });
  }
};

export const getPostsByHashtag = async (req, res) => {
  try {
    const tag = req.params.tag?.toLowerCase();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const filter = { isRemoved: false, hashtags: tag };
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      data: posts.map((p) => formatPost(p, req.userid)),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load hashtag posts" });
  }
};

export const getPostById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }
    const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ data: formatPost(post, req.userid) });
  } catch (error) {
    res.status(500).json({ message: "Failed to load post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const check = await ensureActiveUser(req.userid);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId.toString() !== req.userid) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const { content, type, codeSnippet, codeLanguage, projectUrl, projectTitle, images } =
      req.body;

    if (content !== undefined) {
      post.content = content.trim();
      post.hashtags = [
        ...new Set([
          ...extractHashtags(post.content),
          ...(req.body.hashtags || []).map((t) => t.replace(/^#/, "").toLowerCase()),
        ]),
      ];
    }
    if (type) post.type = type;
    if (codeSnippet !== undefined) post.codeSnippet = codeSnippet;
    if (codeLanguage !== undefined) post.codeLanguage = codeLanguage;
    if (projectUrl !== undefined) post.projectUrl = projectUrl;
    if (projectTitle !== undefined) post.projectTitle = projectTitle;
    if (images !== undefined) post.images = images;

    post.engagementScore = computeEngagementScore(post);
    await post.save();

    res.status(200).json({ data: formatPost(post, req.userid) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await User.findById(req.userid).select("role");
    if (post.authorId.toString() !== req.userid && user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    post.isRemoved = true;
    await post.save();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const check = await ensureActiveUser(req.userid);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid = new mongoose.Types.ObjectId(req.userid);
    const liked = post.likes.some((id) => id.toString() === req.userid);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userid);
    } else {
      post.likes.push(uid);
      await createNotification({
        recipientId: post.authorId,
        actorId: req.userid,
        actorName: check.user.name,
        type: "like",
        postId: post._id,
        message: `${check.user.name} liked your post`,
      });
    }

    post.engagementScore = computeEngagementScore(post);
    await post.save();

    res.status(200).json({
      data: {
        likeCount: post.likes.length,
        likedByMe: !liked,
        engagementScore: post.engagementScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid = new mongoose.Types.ObjectId(req.userid);
    const bookmarked = post.bookmarks.some((id) => id.toString() === req.userid);

    if (bookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== req.userid);
    } else {
      // Enforce bookmark limits
      const currentUser = await User.findById(req.userid);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const plan = currentUser.subscriptionStatus === "active" ? currentUser.plan : "free";
      
      let bookmarkLimit = 3; // Free plan limit
      if (plan === "bronze") bookmarkLimit = 7;
      else if (plan === "silver" || plan === "gold") bookmarkLimit = Infinity;

      if (bookmarkLimit !== Infinity) {
        const count = await Post.countDocuments({ isRemoved: false, bookmarks: req.userid });
        if (count >= bookmarkLimit) {
          return res.status(403).json({
            message: `Bookmark limit reached. Your current plan (${plan.toUpperCase()}) allows up to ${bookmarkLimit} bookmarks. Please upgrade to Silver or Gold to bookmark unlimited posts!`
          });
        }
      }
      post.bookmarks.push(uid);
    }

    await post.save();
    res.status(200).json({ data: { bookmarkedByMe: !bookmarked } });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
};

export const sharePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.shareCount += 1;
    post.engagementScore = computeEngagementScore(post);
    await post.save();

    res.status(200).json({ data: { shareCount: post.shareCount } });
  } catch (error) {
    res.status(500).json({ message: "Failed to share post" });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const filter = { isRemoved: false, bookmarks: req.userid };
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      data: posts.map((p) => formatPost(p, req.userid)),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load bookmarks" });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ message: "Report reason is required" });
    }

    const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await Report.findOne({
      postId: post._id,
      reporterId: req.userid,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ message: "You already reported this post" });
    }

    await Report.create({
      postId: post._id,
      reporterId: req.userid,
      reason: reason.trim(),
    });

    res.status(201).json({ message: "Report submitted for review" });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit report" });
  }
};

export const getTrendingHashtags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $match: { isRemoved: false } },
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      data: tags.map((t) => ({ tag: t._id, count: t.count })),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load trending hashtags" });
  }
};
