import mongoose from "mongoose";

const companySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    description: { type: String, required: true },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    industry: { type: String, default: "" },
    employeesCount: { type: String, default: "1-10" },
    techStack: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    jobs: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: { type: String, default: "Full-time" }, // e.g. Full-time, Part-time, Remote, Contract
        salary: { type: String, default: "" },
        applicants: [
          {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
            name: { type: String, required: true },
            email: { type: String, required: true },
            resumeUrl: { type: String, default: "" },
            appliedAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("company", companySchema);
