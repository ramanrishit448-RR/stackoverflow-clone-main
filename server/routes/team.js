import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  joinTeam,
  createTeamPost,
} from "../controller/team.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getAllTeams);
router.get("/:id", auth, getTeamById);
router.post("/", auth, createTeam);
router.post("/:id/join", auth, joinTeam);
router.post("/:id/posts", auth, createTeamPost);

export default router;
