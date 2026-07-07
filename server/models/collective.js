import mongoose from "mongoose";

const collectiveSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    tag: { type: String, required: true }, // The tech tag associated with it, e.g. "react"
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

export default mongoose.model("collective", collectiveSchema);
