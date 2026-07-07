import mongoose from "mongoose";
import Article from "../models/article.js";
import User from "../models/auth.js";

export const createArticle = async (req, res) => {
  try {
    const { title, content, category, tags = [], coverImage = "", readTime = "3 min read" } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "Title, content, and category are required." });
    }

    const user = await User.findById(req.userid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newArticle = new Article({
      title,
      content,
      category,
      tags: tags.map(tag => tag.trim().toLowerCase()),
      coverImage,
      readTime,
      authorId: req.userid,
      authorName: user.name,
    });

    await newArticle.save();
    res.status(201).json({ data: newArticle });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [search.toLowerCase()] } },
      ];
    }

    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.status(200).json({ data: articles });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid article ID." });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    res.status(200).json({ data: article });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const likeArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid article ID." });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    const index = article.likes.indexOf(req.userid);

    if (index === -1) {
      article.likes.push(req.userid);
    } else {
      article.likes.splice(index, 1);
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, article, { new: true });
    res.status(200).json({ data: updatedArticle });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const addArticleComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid article ID." });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    const user = await User.findById(req.userid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newComment = {
      authorId: req.userid,
      authorName: user.name,
      content: content.trim(),
      createdAt: new Date(),
    };

    article.comments.push(newComment);
    const updatedArticle = await article.save();
    res.status(200).json({ data: updatedArticle });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid article ID." });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    if (article.authorId.toString() !== req.userid) {
      return res.status(403).json({ message: "Access denied. Only the author can delete this article." });
    }

    await Article.findByIdAndDelete(id);
    res.status(200).json({ message: "Article deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};
