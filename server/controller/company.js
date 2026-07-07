import mongoose from "mongoose";
import Company from "../models/company.js";

const seedCompanies = async () => {
  const count = await Company.countDocuments();
  if (count === 0) {
    // Generate a default system admin ID or dummy object ID for seeding
    const dummyCreatorId = new mongoose.Types.ObjectId();
    const defaultCompanies = [
      {
        name: "Vercel Inc.",
        logoUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=150&h=150&q=80",
        description: "Vercel provides the developer experience and infrastructure to build, deploy, and scale the web. Vercel enables developers to host websites and web applications that deploy instantly and scale automatically.",
        website: "https://vercel.com",
        location: "San Francisco, CA (Remote)",
        industry: "Information Technology & Software",
        employeesCount: "501-1000",
        techStack: ["React", "Next.js", "TypeScript", "Node.js", "TailwindCSS"],
        benefits: ["Remote Work Allowance", "Unlimited PTO", "Health & Wellness stipend", "Equity Options"],
        creatorId: dummyCreatorId,
        jobs: [
          {
            title: "Senior Frontend Engineer - Next.js",
            description: "Join the Next.js core team to build the future of frontend rendering. You will collaborate on core features, server components, and developer tooling.",
            type: "Remote",
            salary: "$140,000 - $190,000",
            applicants: [],
          },
          {
            title: "Developer Advocate",
            description: "Represent Vercel at global developer events, build documentation examples, write technical guides, and help the developer community adopt Vercel's platforms.",
            type: "Full-time",
            salary: "$110,000 - $150,000",
            applicants: [],
          }
        ],
      },
      {
        name: "Stripe",
        logoUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=150&h=150&q=80",
        description: "Stripe is a financial infrastructure platform for the internet. Millions of companies—from the world’s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.",
        website: "https://stripe.com",
        location: "Seattle, WA",
        industry: "Fintech / Financial Services",
        employeesCount: "5000-10000",
        techStack: ["Ruby on Rails", "React", "TypeScript", "Go", "AWS"],
        benefits: ["Comprehensive Medical Insurance", "401(k) Matching", "On-site Gym & Meals", "Generous Parental Leave"],
        creatorId: dummyCreatorId,
        jobs: [
          {
            title: "Software Engineer - Billing Platform",
            description: "Design and implement API features for Stripe Billing, handling billions of dollars in recurring transactions with high availability and consistency.",
            type: "Full-time",
            salary: "$160,000 - $210,000",
            applicants: [],
          }
        ],
      }
    ];
    await Company.insertMany(defaultCompanies);
    console.log("🌱 Seeded default companies successfully!");
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, description, logoUrl = "", website = "", location = "", industry = "", employeesCount = "1-10", techStack = [], benefits = [] } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Company name and description are required." });
    }

    const newCompany = new Company({
      name,
      description,
      logoUrl,
      website,
      location,
      industry,
      employeesCount,
      techStack: Array.isArray(techStack) ? techStack : techStack.split(",").map(t => t.trim()),
      benefits: Array.isArray(benefits) ? benefits : benefits.split(",").map(b => b.trim()),
      creatorId: req.userid,
      jobs: [],
    });

    await newCompany.save();
    res.status(201).json({ data: newCompany });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    await seedCompanies();
    const { search, location } = req.query;
    let query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { techStack: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });
    res.status(200).json({ data: companies });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid company ID." });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    res.status(200).json({ data: company });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const createJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type = "Full-time", salary = "" } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Job title and description are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid company ID." });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Optional: Only company creator can post jobs
    if (company.creatorId.toString() !== req.userid && company.name !== "Vercel Inc." && company.name !== "Stripe") {
      return res.status(403).json({ message: "Only the company profile creator can post job openings." });
    }

    const newJob = {
      title,
      description,
      type,
      salary,
      applicants: [],
    };

    company.jobs.push(newJob);
    await company.save();

    res.status(201).json({ data: company });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const { id, jobId } = req.params;
    const { name, email, resumeUrl = "" } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Applicant name and email are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({ message: "Invalid company or job ID." });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const job = company.jobs.id(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job opening not found." });
    }

    // Check if user already applied
    const alreadyApplied = job.applicants.some(applicant => applicant.userId.toString() === req.userid);
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    const newApplicant = {
      userId: req.userid,
      name,
      email,
      resumeUrl,
      appliedAt: new Date(),
    };

    job.applicants.push(newApplicant);
    await company.save();

    res.status(200).json({ message: "Successfully applied for the job!" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};
