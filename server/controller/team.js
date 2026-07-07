import mongoose from "mongoose";
import Team from "../models/team.js";
import User from "../models/auth.js";

export const createTeam = async (req, res) => {
  try {
    const { name, description, logoUrl = "" } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Team name and description are required." });
    }

    const user = await User.findById(req.userid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newTeam = new Team({
      name,
      description,
      logoUrl,
      ownerId: req.userid,
      members: [req.userid],
    });

    await newTeam.save();
    res.status(201).json({ data: newTeam });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.status(200).json({ data: teams });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid team ID." });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Verify user is member of this team
    const isMember = team.members.includes(req.userid);
    if (!isMember) {
      return res.status(403).json({ message: "Access denied. You are not a member of this team." });
    }

    res.status(200).json({ data: team });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid team ID." });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    if (team.members.includes(req.userid)) {
      return res.status(400).json({ message: "You are already a member of this team." });
    }

    team.members.push(req.userid);
    await team.save();

    res.status(200).json({ data: team, message: "Joined team successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};

export const createTeamPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid team ID." });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Only members can post
    if (!team.members.includes(req.userid)) {
      return res.status(403).json({ message: "Only team members can create posts." });
    }

    const user = await User.findById(req.userid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newPost = {
      authorId: req.userid,
      authorName: user.name,
      content: content.trim(),
      createdAt: new Date(),
    };

    team.posts.push(newPost);
    await team.save();

    res.status(201).json({ data: team });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
};
