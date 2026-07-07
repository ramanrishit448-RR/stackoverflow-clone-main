import express from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  createJob,
  applyToJob,
} from "../controller/company.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.post("/", auth, createCompany);
router.post("/:id/jobs", auth, createJob);
router.post("/:id/jobs/:jobId/apply", auth, applyToJob);

export default router;
