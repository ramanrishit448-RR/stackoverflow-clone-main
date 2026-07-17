import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";
import { updateReputation } from "../utils/reputation.js";

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
    const questionDoc = await question.findById(_id);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    const currentUser = await User.findById(req.userid);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const isOwner = questionDoc.userid === String(req.userid);
    const isAdmin = currentUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this question" });
    }

    if (isAdmin && !isOwner) {
      // Content removed by administrator
      if (questionDoc.userid) {
        await updateReputation(
          questionDoc.userid,
          -10,
          "Question removed by administrator due to guideline violations",
          "admin_removal"
        );
      }
    }

    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    if (questionDoc.userid === String(userid)) {
      return res.status(400).json({ message: "You cannot vote on your own question" });
    }

    const upindex = questionDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = questionDoc.downvote.findIndex((id) => id === String(userid));

    let downvoteChange = 0;

    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter((id) => id !== String(userid));
        downvoteChange += 1;
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
        downvoteChange -= 1;
      } else {
        questionDoc.downvote = questionDoc.downvote.filter((id) => id !== String(userid));
        downvoteChange += 1;
      }
    }

    // Check if question receives 10 upvotes reward
    let upvoteRewardChange = 0;
    if (questionDoc.upvote.length >= 10 && !questionDoc.upvotesRewardAwarded) {
      questionDoc.upvotesRewardAwarded = true;
      upvoteRewardChange = 2;
    } else if (questionDoc.upvote.length < 10 && questionDoc.upvotesRewardAwarded) {
      questionDoc.upvotesRewardAwarded = false;
      upvoteRewardChange = -2;
    }

    const authorId = questionDoc.userid;

    // Apply downvote penalty change
    if (downvoteChange !== 0 && authorId) {
      const change = downvoteChange * 2; // -1 downvoteChange = -2 rep. +1 downvoteChange = +2 rep.
      const reason = change < 0 ? "Received a downvote on question" : "Revoked downvote on question";
      const type = change < 0 ? "downvote_received" : "downvote_removed";
      await updateReputation(authorId, change, reason, type);
    }

    // Apply upvote reward change
    if (upvoteRewardChange !== 0 && authorId) {
      const reason = upvoteRewardChange > 0 
        ? "Question received 10 or more upvotes" 
        : "Question fell below 10 upvotes";
      const type = "question_10_upvotes";
      await updateReputation(authorId, upvoteRewardChange, reason, type);
    }

    const questionvote = await question.findByIdAndUpdate(_id, questionDoc, { new: true });
    res.status(200).json({ data: questionvote });
  } catch (error) {
    console.error(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const voteToCloseQuestion = async (req, res) => {
  const { id: _id } = req.params;
  const userid = req.userid;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }

  try {
    const currentUser = await User.findById(userid);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    if ((currentUser.reputation || 0) < 250) {
      return res.status(403).json({ message: "You need at least 250 reputation points to vote to close questions" });
    }

    const questionDoc = await question.findById(_id);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    if (questionDoc.isClosed) {
      return res.status(400).json({ message: "Question is already closed" });
    }

    if (questionDoc.closeVotes.includes(String(userid))) {
      return res.status(400).json({ message: "You have already voted to close this question" });
    }

    questionDoc.closeVotes.push(String(userid));
    if (questionDoc.closeVotes.length >= 3) {
      questionDoc.isClosed = true;
    }

    await questionDoc.save();
    return res.status(200).json({
      message: questionDoc.isClosed ? "Question has been closed" : "Close vote registered successfully",
      data: questionDoc
    });
  } catch (error) {
    console.error("Close question voting failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
