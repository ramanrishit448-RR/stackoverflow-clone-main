import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  ForgotPassword,
  getProfile,
  transferReputation,
  getReputationHistory,
  getReputationTransfers,
  requestLanguageOTP,
  verifyLanguageOTP,
  verifyDeviceOTP,
  getActiveSessions,
  revokeSession,
} from "../controller/auth.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/signup", Signup);
router.post("/login", Login);
router.post("/forgot-password", ForgotPassword);
router.get("/getalluser", getallusers);
router.get("/profile", auth, getProfile);
router.patch("/update/:id", auth, updateprofile);
router.post("/reputation/transfer", auth, transferReputation);
router.get("/reputation/history/:id", getReputationHistory);
router.get("/reputation/transfers/:id", getReputationTransfers);
router.post("/request-language-otp", auth, requestLanguageOTP);
router.post("/verify-language-otp", auth, verifyLanguageOTP);
router.post("/verify-device-otp", verifyDeviceOTP);
router.get("/sessions", auth, getActiveSessions);
router.delete("/sessions/:id", auth, revokeSession);
export default router;
