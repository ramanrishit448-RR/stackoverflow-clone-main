import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  joinTeam,
  createTeamPost,
  addTeamMember,
} from "../controller/team.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getAllTeams);
router.get("/:id", auth, getTeamById);
router.post("/", auth, createTeam);
router.post("/:id/join", auth, joinTeam);
router.post("/:id/posts", auth, createTeamPost);
router.post("/:id/add-member", auth, addTeamMember);

export default router;
