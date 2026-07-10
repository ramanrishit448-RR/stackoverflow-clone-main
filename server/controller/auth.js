import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail, sendSMS } from "../utils/delivery.js";
import ReputationHistory from "../models/reputationHistory.js";
import { updateReputation } from "../utils/reputation.js";

const sanitizeUser = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.password;
  return obj;
};

const generateRandomPassword = () => {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let password = "";
  for (let i = 0; i < 10; i += 1) {
    password += letters[Math.floor(Math.random() * letters.length)];
  }
  return password;
};

export const Signup = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      phone,
      password: hashpassword,
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).json({ data: sanitizeUser(newuser), token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const ispasswordcrct = await bcrypt.compare(
      password,
      exisitinguser.password,
    );
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).json({ data: sanitizeUser(exisitinguser), token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const ForgotPassword = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ message: "Please provide email or phone." });
  }
  try {
    const existingUser = await user.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const lastRequest = existingUser.lastForgotPasswordRequest;
    if (lastRequest) {
      const now = new Date();
      const sameDay =
        lastRequest.getUTCFullYear() === now.getUTCFullYear() &&
        lastRequest.getUTCMonth() === now.getUTCMonth() &&
        lastRequest.getUTCDate() === now.getUTCDate();
      if (sameDay) {
        return res
          .status(429)
          .json({ message: "You can use this option only one time per day." });
      }
    }

    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    existingUser.password = hashedPassword;
    existingUser.lastForgotPasswordRequest = new Date();
    await existingUser.save();

    let deliveredVia = "Email/SMS";
    if (identifier.includes("@")) {
      deliveredVia = "Email";
      await sendEmail({
        to: existingUser.email,
        subject: "[StackOverflow Clone] Password Reset Request",
        text: `Hello ${existingUser.name},\n\nYour password has been reset successfully.\n\nYour temporary password is: ${newPassword}\n\nPlease log in and update your password immediately.\n\nBest regards,\nStackOverflow Clone Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #f97316;">StackOverflow Clone</h2>
            </div>
            <p>Hello <strong>${existingUser.name}</strong>,</p>
            <p>Your password has been reset successfully. Here is your temporary password to log in:</p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #1e3a8a; border-radius: 8px; margin: 20px 0;">
              ${newPassword}
            </div>
            <p style="color: #475569;">Please log in and update your password under your profile settings immediately.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
          </div>
        `
      });
    } else {
      deliveredVia = "SMS";
      await sendSMS({
        to: existingUser.phone || identifier,
        body: `StackOverflow Clone: Your temporary password is: ${newPassword}. Please log in and change it immediately.`
      });
    }

    return res.status(200).json({
      message: `Password reset successful. Sent temporary password via ${deliveredVia}.`,
      deliveredVia,
      debugPassword: newPassword,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find().select("-password");
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags, emailNotifications, smsNotifications } =
    req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const existingUser = await user.findById(_id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    existingUser.name = name || existingUser.name;
    existingUser.about = about || existingUser.about;
    existingUser.tags = tags || existingUser.tags;
    if (emailNotifications !== undefined) {
      existingUser.emailNotifications = emailNotifications;
    }
    if (smsNotifications !== undefined) {
      existingUser.smsNotifications = smsNotifications;
    }

    const isComplete =
      existingUser.name &&
      existingUser.about &&
      existingUser.phone &&
      existingUser.tags &&
      existingUser.tags.length > 0;

    if (isComplete && !existingUser.profileCompletionBonusAwarded) {
      existingUser.profileCompletionBonusAwarded = true;
      existingUser.reputation = (existingUser.reputation || 0) + 10;
      await existingUser.save();

      const logEntry = new ReputationHistory({
        userId: _id,
        change: 10,
        reason: "Completed user profile with all mandatory details",
        type: "profile_completed",
      });
      await logEntry.save();
    } else {
      await existingUser.save();
    }

    res.status(200).json({ data: sanitizeUser(existingUser) });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getProfile = async (req, res) => {
  try {
    const currentUser = await user.findById(req.userid).select("-password");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ data: currentUser });
  } catch (error) {
    console.error("Get profile failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const transferReputation = async (req, res) => {
  const { receiverId, amount, reason } = req.body;
  const senderId = req.userid;

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({ message: "Invalid receiver ID" });
  }
  if (String(senderId) === String(receiverId)) {
    return res.status(400).json({ message: "Cannot transfer reputation to yourself" });
  }

  const transferAmount = parseInt(amount);
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ message: "Transfer amount must be a positive integer" });
  }
  if (transferAmount > 50) {
    return res.status(400).json({ message: "Maximum transfer limit of 50 points per transaction" });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: "Reason for transfer is required" });
  }

  try {
    const sender = await user.findById(senderId);
    const receiver = await user.findById(receiverId);

    if (!sender) return res.status(404).json({ message: "Sender not found" });
    if (!receiver) return res.status(404).json({ message: "Receiver not found" });

    if ((sender.reputation || 0) <= 50) {
      return res.status(400).json({ message: "You need more than 50 reputation points to transfer" });
    }
    if ((sender.reputation || 0) - transferAmount < 0) {
      return res.status(400).json({ message: "Insufficient reputation points" });
    }

    // Validate daily transfer limit (max 100 points per day)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ReputationTransfer = (await import("../models/reputationTransfer.js")).default;
    const sentToday = await ReputationTransfer.find({
      senderId,
      timestamp: { $gte: startOfToday }
    });

    const totalSentToday = sentToday.reduce((sum, txn) => sum + txn.amount, 0);
    if (totalSentToday + transferAmount > 100) {
      return res.status(400).json({
        message: `Daily transfer limit exceeded. You have already transferred ${totalSentToday} points today. Max daily limit is 100.`
      });
    }

    // Deduct from sender
    sender.reputation = (sender.reputation || 0) - transferAmount;
    await sender.save();

    const senderLog = new ReputationHistory({
      userId: senderId,
      change: -transferAmount,
      reason: `Transferred points to ${receiver.name}: ${reason}`,
      type: "transfer_sent"
    });
    await senderLog.save();

    // Add to receiver
    receiver.reputation = (receiver.reputation || 0) + transferAmount;
    await receiver.save();

    const receiverLog = new ReputationHistory({
      userId: receiverId,
      change: transferAmount,
      reason: `Received points from ${sender.name}: ${reason}`,
      type: "transfer_received"
    });
    await receiverLog.save();

    // Record transaction
    const transaction = new ReputationTransfer({
      senderId,
      receiverId,
      amount: transferAmount,
      reason: reason.trim()
    });
    await transaction.save();

    return res.status(200).json({
      message: `Transferred ${transferAmount} points successfully to ${receiver.name}!`,
      senderReputation: sender.reputation
    });
  } catch (error) {
    console.error("Transfer reputation failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getReputationHistory = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const history = await ReputationHistory.find({ userId: id }).sort({ timestamp: -1 });
    return res.status(200).json({ data: history });
  } catch (error) {
    console.error("Get reputation history failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getReputationTransfers = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const ReputationTransfer = (await import("../models/reputationTransfer.js")).default;
    const transfers = await ReputationTransfer.find({
      $or: [{ senderId: id }, { receiverId: id }]
    })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ timestamp: -1 });

    return res.status(200).json({ data: transfers });
  } catch (error) {
    console.error("Get reputation transfers failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
