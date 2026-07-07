import mongoose from "mongoose";
import Collective from "../models/collective.js";

const seedCollectives = async () => {
  const count = await Collective.countDocuments();
  if (count === 0) {
    const defaultCollectives = [
      {
        name: "React Developer Collective",
        description: "Explore questions, resources, and announcements about React, Next.js, and React Native frontend development.",
        logoUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=150&h=150&q=80",
        tag: "react",
        members: [],
      },
      {
        name: "AWS Infrastructure Collective",
        description: "Discuss AWS Cloud architectures, CDK, serverless architectures, DynamoDB, Lambda, and devops processes.",
        logoUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=150&h=150&q=80",
        tag: "aws",
        members: [],
      },
      {
        name: "AI & Data Science Collective",
        description: "Dive deep into Machine Learning models, TensorFlow, PyTorch, Python engineering, and modern AI algorithms.",
        logoUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=150&h=150&q=80",
        tag: "python",
        members: [],
      },
    ];
    await Collective.insertMany(defaultCollectives);
    console.log("🌱 Seeded default collectives successfully!");
  }
};

export const getAllCollectives = async (req, res) => {
  try {
    await seedCollectives();
    const collectives = await Collective.find();
    res.status(200).json({ data: collectives });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const joinCollective = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid collective ID." });
    }

    const collective = await Collective.findById(id);
    if (!collective) {
      return res.status(404).json({ message: "Collective not found." });
    }

    const index = collective.members.indexOf(req.userid);

    if (index === -1) {
      collective.members.push(req.userid);
    } else {
      collective.members.splice(index, 1);
    }

    await collective.save();
    res.status(200).json({ data: collective });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};
