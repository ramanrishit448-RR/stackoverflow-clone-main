import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    return res.status(200).json({
      message: "Password reset successful.",
      password: newPassword,
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
  const { name, about, tags, emailNotifications, smsNotifications } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateprofile = await user
      .findByIdAndUpdate(
        _id,
        {
          $set: {
            name,
            about,
            tags,
            emailNotifications,
            smsNotifications,
          },
        },
        { new: true },
      )
      .select("-password");
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};
