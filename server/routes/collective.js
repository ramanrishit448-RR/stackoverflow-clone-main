import express from "express";
import {
  getAllCollectives,
  joinCollective,
} from "../controller/collective.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCollectives);
router.post("/:id/join", auth, joinCollective);

export default router;
