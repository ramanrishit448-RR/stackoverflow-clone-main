import crypto from "crypto";
import Razorpay from "razorpay";
import user from "../models/auth.js";
import Invoice from "../models/invoice.js";
import { sendEmail } from "../utils/delivery.js";
import { generateInvoicePdf } from "../utils/invoicePdf.js";

const PLAN_PRICES = {
  free: 0,
  bronze: 99,
  silver: 299,
  gold: 999,
};

const getRazorpayInstance = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return null;
};

export const createOrder = async (req, res) => {
  const { plan } = req.body;
  const planLower = (plan || "").toLowerCase();

  if (!PLAN_PRICES.hasOwnProperty(planLower) || planLower === "free") {
    return res.status(400).json({ message: "Invalid plan selection" });
  }

  const amount = PLAN_PRICES[planLower] * 100; // in paise

  try {
    const rzp = getRazorpayInstance();
    if (rzp) {
      const order = await rzp.orders.create({
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      return res.status(200).json({
        success: true,
        isMock: false,
        orderId: order.id,
        amount: order.amount,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } else {
      // Mock payment fallback
      const mockOrderId = `mock_order_${Math.random().toString(36).substring(2, 11)}`;
      return res.status(200).json({
        success: true,
        isMock: true,
        orderId: mockOrderId,
        amount,
      });
    }
  } catch (error) {
    console.error("Create order failed:", error);
    return res.status(500).json({ message: "Failed to initiate payment" });
  }
};

export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    billingDetails,
    isMock,
  } = req.body;

  const planLower = (plan || "").toLowerCase();
  if (!PLAN_PRICES.hasOwnProperty(planLower)) {
    return res.status(400).json({ message: "Invalid plan" });
  }

  try {
    // 1. Signature check (if not mock)
    const rzp = getRazorpayInstance();
    if (rzp && !isMock) {
      const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");

      if (digest !== razorpay_signature) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    }

    // 2. Fetch User
    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Generate Invoice Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    const amount = PLAN_PRICES[planLower];
    const finalBillingDetails = {
      name: billingDetails?.name || currentUser.name,
      email: billingDetails?.email || currentUser.email,
      address: billingDetails?.address || "N/A",
    };

    // 4. Create Invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      userId: req.userid,
      planName: planLower,
      amount,
      paymentId: razorpay_payment_id || `mock_pay_${Date.now()}`,
      billingName: finalBillingDetails.name,
      billingEmail: finalBillingDetails.email,
      billingAddress: finalBillingDetails.address,
    });

    // 5. Update User subscription dates
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days validity

    currentUser.plan = planLower;
    currentUser.subscriptionStatus = "active";
    currentUser.subscriptionStartDate = new Date();
    currentUser.subscriptionEndDate = expiryDate;
    currentUser.billingName = finalBillingDetails.name;
    currentUser.billingEmail = finalBillingDetails.email;
    currentUser.billingAddress = finalBillingDetails.address;
    await currentUser.save();

    // 6. Send Confirmation Email with invoice summary
    const subject = `Subscription Confirmed - StackOverflow ${plan.toUpperCase()}`;
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #f97316; margin: 0; font-size: 24px;">StackOverflow Premium</h1>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Your subscription has been activated successfully!</p>
        </div>
        
        <p>Dear <strong>${currentUser.name}</strong>,</p>
        <p>Thank you for subscribing! Your account has been upgraded to the <strong>${plan.toUpperCase()} Plan</strong>. All plan perks have been instantly unlocked.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Plan Information</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Plan:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0f172a;">${plan.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Price:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #16a34a;">₹${amount}.00/month</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Renewal Date:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0f172a;">${expiryDate.toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Invoice Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Invoice No:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0f172a;">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Transaction ID:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a;">${invoice.paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Billing To:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a;">${finalBillingDetails.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Billing Address:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${finalBillingDetails.address}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
          <p>You can download the full PDF invoice directly from your profile billing dashboard.</p>
          <p style="font-weight: bold; color: #f97316; margin-top: 10px;">StackOverflow Clone Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: currentUser.email,
      subject,
      html: emailHtml,
      text: `Subscription activated! Plan: ${plan.toUpperCase()}, Amount: ₹${amount}.00, Invoice Number: ${invoiceNumber}`,
    });

    const userObj = currentUser.toObject();
    delete userObj.password;

    return res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    console.error("Verify payment failed:", error);
    return res.status(500).json({ message: "Failed to complete subscription upgrade" });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.userid }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Get invoices failed:", error);
    return res.status(500).json({ message: "Failed to load payment history" });
  }
};

export const downloadInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.userId.toString() !== req.userid) {
      return res.status(403).json({ message: "Unauthorized access to invoice" });
    }

    const currentUser = await user.findById(req.userid);
    const pdfBuffer = await generateInvoicePdf(invoice, currentUser);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Download invoice failed:", error);
    return res.status(500).json({ message: "Failed to generate invoice PDF" });
  }
};

export const updateBilling = async (req, res) => {
  const { billingName, billingEmail, billingAddress } = req.body;
  try {
    const currentUser = await user.findByIdAndUpdate(
      req.userid,
      {
        $set: { billingName, billingEmail, billingAddress },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({ success: true, data: currentUser });
  } catch (error) {
    console.error("Update billing failed:", error);
    return res.status(500).json({ message: "Failed to update billing details" });
  }
};

export const submitSupportTicket = async (req, res) => {
  const { subject, message } = req.body;
  try {
    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.plan !== "silver" && currentUser.plan !== "gold") {
      return res.status(403).json({
        message: "Priority customer support is only available for Silver and Gold plan members.",
      });
    }

    const ticketEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #f97316;">[Priority Support Ticket Received]</h2>
        <p><strong>User:</strong> ${currentUser.name} (${currentUser.email})</p>
        <p><strong>Plan Tier:</strong> ${currentUser.plan.toUpperCase()}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
        <p><strong>Message:</strong></p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</div>
        <p style="margin-top: 20px; font-size: 11px; color: #94a3b8;">This ticket has been marked with priority support status.</p>
      </div>
    `;

    await sendEmail({
      to: "support@stackoverflow-clone.com",
      subject: `[PRIORITY SUPPORT - ${currentUser.plan.toUpperCase()}] ${subject}`,
      html: ticketEmail,
      text: `Priority Support Ticket: ${subject} from ${currentUser.name} (${currentUser.email}). Message: ${message}`,
    });

    return res.status(200).json({
      success: true,
      message: "Priority support ticket submitted successfully. Our helpdesk team will contact you shortly.",
    });
  } catch (error) {
    console.error("Support ticket failure:", error);
    return res.status(500).json({ message: "Failed to submit support ticket" });
  }
};
