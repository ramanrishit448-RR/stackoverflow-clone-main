import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isRemoved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: 1 });
commentSchema.index({ parentId: 1 });

export default mongoose.model("Comment", commentSchema);
