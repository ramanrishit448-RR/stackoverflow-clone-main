import mongoose from "mongoose";

const teamSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    posts: [
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

export default mongoose.model("team", teamSchema);
