import express from "express";
import { adminAuth } from "../middleware/auth.js";
import {
  getReports,
  promoteAdmin,
  removePostAdmin,
  reviewReport,
  suspendUserAdmin,
  getLoginActivityLogs,
} from "../controller/admin.js";

const router = express.Router();

router.get("/reports", adminAuth, getReports);
router.patch("/reports/:id", adminAuth, reviewReport);
router.delete("/posts/:id", adminAuth, removePostAdmin);
router.patch("/users/:id/suspend", adminAuth, suspendUserAdmin);
router.patch("/users/:id/promote", adminAuth, promoteAdmin);
router.get("/login-activity", adminAuth, getLoginActivityLogs);

export default router;
