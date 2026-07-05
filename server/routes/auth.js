import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  ForgotPassword,
  getProfile,
} from "../controller/auth.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/signup", Signup);
router.post("/login", Login);
router.post("/forgot-password", ForgotPassword);
router.get("/getalluser", getallusers);
router.get("/profile", auth, getProfile);
router.patch("/update/:id", auth, updateprofile);
export default router;
