import mongoose from "mongoose";

const invoiceSchema = mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  planName: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  paymentId: { type: String, required: true },
  paymentStatus: { type: String, default: "paid" },
  createdAt: { type: Date, default: Date.now },
  billingName: String,
  billingEmail: String,
  billingAddress: String,
});

export default mongoose.model("Invoice", invoiceSchema);
