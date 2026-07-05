import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";

export const Askquestion = async (req, res) => {
  const { postquestiondata } = req.body;
  
  try {
    const currentUser = await User.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = currentUser.subscriptionStatus === "active" ? currentUser.plan : "free";
    let limit = 1; // free plan
    if (plan === "bronze") limit = 5;
    else if (plan === "silver") limit = 15;
    else if (plan === "gold") limit = Infinity;

    if (limit !== Infinity) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const count = await question.countDocuments({
        userid: req.userid,
        askedon: { $gte: startOfDay, $lte: endOfDay }
      });

      if (count >= limit) {
        return res.status(403).json({
          message: `Daily question limit reached. Your current plan (${plan.toUpperCase()}) allows up to ${limit} questions per day. Please upgrade to post more!`
        });
      }
    }

    const postques = new question({ ...postquestiondata });
    await postques.save();
    res.status(200).json({ data: postques });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getallquestion = async (req, res) => {
  try {
    const allquestion = await question.find().sort({ askedon: -1 });

    const userIds = allquestion.map((q) => q.userid).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select("plan subscriptionStatus");

    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = {
        plan: u.subscriptionStatus === "active" ? u.plan : "free"
      };
      return acc;
    }, {});

    const questionsWithPlan = allquestion.map((q) => {
      const qObj = q.toObject();
      qObj.userPlan = userMap[q.userid]?.plan || "free";
      return qObj;
    });

    const planPriority = { gold: 3, silver: 2, bronze: 1, free: 0 };
    questionsWithPlan.sort((a, b) => {
      const priorityA = planPriority[a.userPlan] || 0;
      const priorityB = planPriority[b.userPlan] || 0;
      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }
      return new Date(b.askedon).getTime() - new Date(a.askedon).getTime();
    });

    res.status(200).json({ data: questionsWithPlan });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};
export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value ,userid} = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    const upindex = questionDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = questionDoc.downvote.findIndex(
      (id) => id === String(userid)
    );
    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
      if (upindex === -1) {
        questionDoc.upvote.push(userid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        questionDoc.downvote.push(userid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
    }
    const questionvote = await question.findByIdAndUpdate(_id, questionDoc, { new: true });
    res.status(200).json({ data: questionvote });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
