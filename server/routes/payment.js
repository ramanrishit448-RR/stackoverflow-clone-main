import express from "express";
import auth from "../middleware/auth.js";
import {
  createOrder,
  verifyPayment,
  getInvoices,
  downloadInvoice,
  updateBilling,
  submitSupportTicket,
} from "../controller/payment.js";

const router = express.Router();

router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);
router.get("/invoices", auth, getInvoices);
router.get("/invoices/:id/download", auth, downloadInvoice);
router.post("/update-billing", auth, updateBilling);
router.post("/support-ticket", auth, submitSupportTicket);

export default router;
