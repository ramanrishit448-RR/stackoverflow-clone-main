import express from "express";
import {
  createArticle,
  getAllArticles,
  getArticleById,
  likeArticle,
  addArticleComment,
  deleteArticle,
} from "../controller/article.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.post("/", auth, createArticle);
router.post("/:id/like", auth, likeArticle);
router.post("/:id/comment", auth, addArticleComment);
router.delete("/:id", auth, deleteArticle);

export default router;
