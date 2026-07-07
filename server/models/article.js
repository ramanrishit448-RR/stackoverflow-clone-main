import mongoose from "mongoose";

const articleSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    coverImage: { type: String, default: "" },
    readTime: { type: String, default: "3 min read" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    authorName: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    comments: [
      {
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        authorName: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("article", articleSchema);
