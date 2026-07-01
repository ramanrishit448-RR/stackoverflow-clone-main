import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    authorName: { type: String, required: true },
    type: {
      type: String,
      enum: ["update", "image", "code", "project", "achievement"],
      default: "update",
    },
    content: { type: String, required: true },
    codeSnippet: { type: String },
    codeLanguage: { type: String },
    projectUrl: { type: String },
    projectTitle: { type: String },
    images: [{ type: String }],
    hashtags: [{ type: String, lowercase: true, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    shareCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    isRemoved: { type: Boolean, default: false },
    removedReason: { type: String },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ engagementScore: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
