import express from "express";
import auth, { optionalAuth } from "../middleware/auth.js";
import {
  createPost,
  deletePost,
  getBookmarks,
  getFeed,
  getPostById,
  getPostsByHashtag,
  getTrending,
  getTrendingHashtags,
  reportPost,
  sharePost,
  toggleBookmark,
  toggleLike,
  updatePost,
} from "../controller/feed.js";
import {
  addComment,
  deleteComment,
  getComments,
  toggleCommentLike,
  updateComment,
} from "../controller/comment.js";

const router = express.Router();

router.get("/trending/hashtags", getTrendingHashtags);
router.get("/trending", optionalAuth, getTrending);
router.get("/hashtag/:tag", optionalAuth, getPostsByHashtag);
router.get("/bookmarks", auth, getBookmarks);
router.get("/", optionalAuth, getFeed);

router.post("/", auth, createPost);
router.get("/:postId/comments", optionalAuth, getComments);
router.post("/:postId/comments", auth, addComment);
router.patch("/comments/:id", auth, updateComment);
router.delete("/comments/:id", auth, deleteComment);
router.post("/comments/:id/like", auth, toggleCommentLike);

router.get("/:id", optionalAuth, getPostById);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.post("/:id/like", auth, toggleLike);
router.post("/:id/bookmark", auth, toggleBookmark);
router.post("/:id/share", optionalAuth, sharePost);
router.post("/:id/report", auth, reportPost);

export default router;
