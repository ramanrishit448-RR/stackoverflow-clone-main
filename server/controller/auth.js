import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail, sendSMS } from "../utils/delivery.js";
import ReputationHistory from "../models/reputationHistory.js";
import { updateReputation } from "../utils/reputation.js";
import Session from "../models/session.js";
import LoginActivity from "../models/loginActivity.js";

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
  const { name, email, password, phone, deviceId } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const resolvedDeviceId = deviceId || "unknown_device_" + Math.random().toString(36).substring(2, 10);
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      phone,
      password: hashpassword,
      trustedDevices: [resolvedDeviceId],
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const userAgentString = req.headers["user-agent"] || "";
    const { browser, os, deviceType } = parseUserAgent(userAgentString);
    const location = getMockLocation(ip);

    await Session.create({
      userId: newuser._id,
      token,
      browser,
      os,
      deviceType,
      ip,
      location,
      deviceId: resolvedDeviceId,
      isTrusted: true,
      isVerified: true,
    });

    res.status(200).json({ data: sanitizeUser(newuser), token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json("something went wrong..");
    return;
  }
};

const parseUserAgent = (uaString) => {
  if (!uaString) {
    return { browser: "Unknown", os: "Unknown", deviceType: "Unknown" };
  }
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType = "Desktop";

  if (uaString.includes("Firefox/")) browser = "Firefox";
  else if (uaString.includes("Edg/")) browser = "Edge";
  else if (uaString.includes("Chrome/")) browser = "Chrome";
  else if (uaString.includes("Safari/")) browser = "Safari";
  else if (uaString.includes("MSIE ") || uaString.includes("Trident/")) browser = "Internet Explorer";

  if (uaString.includes("Windows NT")) os = "Windows";
  else if (uaString.includes("Macintosh")) os = "macOS";
  else if (uaString.includes("Android")) os = "Android";
  else if (uaString.includes("iPhone") || uaString.includes("iPad")) os = "iOS";
  else if (uaString.includes("Linux")) os = "Linux";

  if (uaString.includes("Mobile") || uaString.includes("Android") || uaString.includes("iPhone")) {
    deviceType = "Mobile";
  } else if (uaString.includes("iPad") || uaString.includes("Tablet")) {
    deviceType = "Tablet";
  }

  return { browser, os, deviceType };
};

const getMockLocation = (ip) => {
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.0.0.1")) {
    return "Localhost / Development";
  }
  return "New York, USA";
};

export const Login = async (req, res) => {
  const { email, password, deviceId } = req.body;
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgentString = req.headers["user-agent"] || "";
  const { browser, os, deviceType } = parseUserAgent(userAgentString);
  const location = getMockLocation(ip);

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
      await LoginActivity.create({
        userId: exisitinguser._id,
        email,
        browser,
        os,
        deviceType,
        ip,
        location,
        status: "failed_password",
      });
      return res.status(400).json({ message: "Invalid password" });
    }

    const resolvedDeviceId = deviceId || "unknown_device_" + Math.random().toString(36).substring(2, 10);
    const isDeviceTrusted = exisitinguser.trustedDevices.includes(resolvedDeviceId);

    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    if (isDeviceTrusted) {
      await Session.create({
        userId: exisitinguser._id,
        token,
        browser,
        os,
        deviceType,
        ip,
        location,
        deviceId: resolvedDeviceId,
        isTrusted: true,
        isVerified: true,
      });

      await LoginActivity.create({
        userId: exisitinguser._id,
        email,
        browser,
        os,
        deviceType,
        ip,
        location,
        status: "success",
      });

      return res.status(200).json({ status: "success", data: sanitizeUser(exisitinguser), token });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const tempSession = await Session.create({
        userId: exisitinguser._id,
        token,
        browser,
        os,
        deviceType,
        ip,
        location,
        deviceId: resolvedDeviceId,
        isTrusted: false,
        isVerified: false,
        verificationOTP: otp,
        verificationOTPExpiry: expiry,
      });

      await sendEmail({
        to: exisitinguser.email,
        subject: "[StackOverflow Clone] Unrecognized Device Login OTP",
        text: `Hello ${exisitinguser.name},\n\nWe detected a login attempt from an unrecognized device:\n\nOS: ${os}\nBrowser: ${browser}\nIP: ${ip}\nLocation: ${location}\n\nYour 6-digit OTP verification code is: ${otp}\n\nIf you did not request this, please change your password immediately.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #ea580c; text-align: center;">Unrecognized Device Detected</h2>
            <p>Hello <strong>${exisitinguser.name}</strong>,</p>
            <p>We detected a login attempt from a new or unrecognized device with details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Browser:</td><td style="color: #1e293b;">${browser}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">OS:</td><td style="color: #1e293b;">${os}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">IP:</td><td style="color: #1e293b;">${ip}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Location:</td><td style="color: #1e293b;">${location}</td></tr>
            </table>
            <p>Please enter this 6-digit verification code to log in and mark this device as trusted. This code is valid for 10 minutes:</p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1e3a8a; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #ef4444; font-size: 13px;">If this login attempt wasn't you, please change your password immediately.</p>
          </div>
        `
      });

      await LoginActivity.create({
        userId: exisitinguser._id,
        email,
        browser,
        os,
        deviceType,
        ip,
        location,
        status: "pending_otp",
      });

      return res.status(200).json({
        status: "pending_otp",
        sessionId: tempSession._id,
        message: "Login from unrecognized device. Verification required.",
        debugOTP: otp
      });
    }
  } catch (error) {
    console.error(error);
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
  const { name, about, tags, emailNotifications, smsNotifications, phone } =
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
    if (phone !== undefined) {
      existingUser.phone = phone;
    }
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

export const requestLanguageOTP = async (req, res) => {
  const { language } = req.body;
  const userId = req.userid;

  if (!language) {
    return res.status(400).json({ message: "Language is required" });
  }

  const supportedLanguages = ["en", "es", "hi", "pt", "zh", "fr"];
  if (!supportedLanguages.includes(language)) {
    return res.status(400).json({ message: "Unsupported language" });
  }

  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.language === language) {
      return res.status(400).json({ message: `Language is already set to ${language}` });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    existingUser.languageOTP = otp;
    existingUser.languageOTPExpiry = expiry;
    existingUser.pendingLanguage = language;
    await existingUser.save();

    let method = "sms";
    let recipient = "";

    if (existingUser.phone) {
      method = "sms";
      recipient = existingUser.phone;
      const langNameMap = {
        en: "English",
        es: "Spanish",
        hi: "Hindi",
        pt: "Portuguese",
        zh: "Chinese",
        fr: "French"
      };
      const langName = langNameMap[language] || language;
      await sendSMS({
        to: recipient,
        body: `StackOverflow Clone: Your OTP to change the website language to ${langName} is: ${otp}. Valid for 10 minutes.`
      });
    } else {
      method = "email";
      recipient = existingUser.email;
      const langNameMap = {
        en: "English",
        es: "Spanish",
        hi: "Hindi",
        pt: "Portuguese",
        zh: "Chinese",
        fr: "French"
      };
      const langName = langNameMap[language] || language;
      await sendEmail({
        to: recipient,
        subject: "[StackOverflow Clone] Language Change OTP",
        text: `Hello ${existingUser.name},\n\nYour OTP to change the website language to ${langName} is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nBest regards,\nStackOverflow Clone Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #f97316; text-align: center;">Language Change Verification</h2>
            <p>Hello <strong>${existingUser.name}</strong>,</p>
            <p>You requested to change the language of your account to ${langName}.</p>
            <p>Please use the following 6-digit One-Time Password (OTP) to complete the change. This OTP is valid for 10 minutes:</p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1e3a8a; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #475569;">If you did not request this change, please ignore this email.</p>
          </div>
        `
      });
    }

    return res.status(200).json({
      message: `Verification OTP sent to your registered ${method}.`,
      method,
      recipient,
      debugOTP: otp
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const verifyLanguageOTP = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userid;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!existingUser.languageOTP || !existingUser.pendingLanguage) {
      return res.status(400).json({ message: "No language change request in progress" });
    }

    if (existingUser.languageOTPExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (existingUser.languageOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const newLanguage = existingUser.pendingLanguage;
    existingUser.language = newLanguage;
    existingUser.languageOTP = undefined;
    existingUser.languageOTPExpiry = undefined;
    existingUser.pendingLanguage = undefined;
    await existingUser.save();

    return res.status(200).json({
      message: "Language updated successfully",
      data: sanitizeUser(existingUser)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyDeviceOTP = async (req, res) => {
  const { sessionId, otp } = req.body;

  if (!sessionId || !otp) {
    return res.status(400).json({ message: "Session ID and OTP are required" });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.isVerified) {
      return res.status(400).json({ message: "Session is already verified" });
    }

    if (session.verificationOTPExpiry < new Date()) {
      await LoginActivity.create({
        userId: session.userId,
        email: "unknown",
        browser: session.browser,
        os: session.os,
        deviceType: session.deviceType,
        ip: session.ip,
        location: session.location,
        status: "otp_failed",
      });
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (session.verificationOTP !== otp) {
      await LoginActivity.create({
        userId: session.userId,
        email: "unknown",
        browser: session.browser,
        os: session.os,
        deviceType: session.deviceType,
        ip: session.ip,
        location: session.location,
        status: "otp_failed",
      });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    session.isVerified = true;
    session.verificationOTP = undefined;
    session.verificationOTPExpiry = undefined;
    await session.save();

    const matchedUser = await user.findById(session.userId);
    if (matchedUser) {
      if (!matchedUser.trustedDevices.includes(session.deviceId)) {
        matchedUser.trustedDevices.push(session.deviceId);
        await matchedUser.save();
      }

      await LoginActivity.create({
        userId: matchedUser._id,
        email: matchedUser.email,
        browser: session.browser,
        os: session.os,
        deviceType: session.deviceType,
        ip: session.ip,
        location: session.location,
        status: "success",
      });

      await sendEmail({
        to: matchedUser.email,
        subject: "[StackOverflow Clone] New Device Login Alert",
        text: `Hello ${matchedUser.name},\n\nWe detected a successful login to your account from a new device:\n\nOS: ${session.os}\nBrowser: ${session.browser}\nIP: ${session.ip}\nLocation: ${session.location}\nDate/Time: ${session.createdAt.toLocaleString()}\n\nIf this was you, you can ignore this email. If this login was unauthorized, please log in to your profile and revoke the session immediately.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #ea580c; text-align: center;">New Device Login Alert</h2>
            <p>Hello <strong>${matchedUser.name}</strong>,</p>
            <p>We detected a successful login to your account from a new or unrecognized device:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Browser:</td><td style="color: #1e293b;">${session.browser}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">OS:</td><td style="color: #1e293b;">${session.os}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">IP:</td><td style="color: #1e293b;">${session.ip}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Location:</td><td style="color: #1e293b;">${session.location}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Date/Time:</td><td style="color: #1e293b;">${session.createdAt.toLocaleString()}</td></tr>
            </table>
            <p style="color: #475569;">If this was you, no action is needed. If you do not recognize this login, please immediately log in, navigate to your profile and revoke this session, and update your password.</p>
          </div>
        `
      });

      return res.status(200).json({
        status: "success",
        token: session.token,
        data: sanitizeUser(matchedUser)
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getActiveSessions = async (req, res) => {
  const userId = req.userid;
  const authHeader = req.headers.authorization;
  const currentToken = authHeader?.split(" ")[1];

  try {
    const sessions = await Session.find({ userId, isVerified: true }).sort({ lastActive: -1 });
    const formattedSessions = sessions.map((s) => {
      const obj = s.toObject();
      obj.isCurrent = s.token === currentToken;
      delete obj.token;
      delete obj.verificationOTP;
      return obj;
    });
    return res.status(200).json({ success: true, data: formattedSessions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const revokeSession = async (req, res) => {
  const userId = req.userid;
  const { id } = req.params;

  try {
    const session = await Session.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const matchedUser = await user.findById(userId);

    await LoginActivity.create({
      userId,
      email: matchedUser?.email || "unknown",
      browser: session.browser,
      os: session.os,
      deviceType: session.deviceType,
      ip: session.ip,
      location: session.location,
      status: "revoked",
    });

    await session.deleteOne();

    return res.status(200).json({ success: true, message: "Session revoked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
