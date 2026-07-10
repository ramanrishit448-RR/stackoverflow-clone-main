import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";
import { updateReputation } from "../utils/reputation.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  const { noofanswer, answerbody, useranswered, userid } = req.body;
  updatenoofanswer(_id, noofanswer);

  try {
    const updatequestion = await question.findByIdAndUpdate(_id, {
      $addToSet: { answer: [{ answerbody, useranswered, userid }] },
    });

    // Award +5 reputation points for posting an answer
    if (userid) {
      await updateReputation(userid, 5, "Posted an answer", "answer_posted");
    }

    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

const updatenoofanswer = async (_id, noofanswer) => {
  try {
    await question.findByIdAndUpdate(_id, { $set: { noofanswer: noofanswer } });
  } catch (error) {
    console.log(error);
  }
};

export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noofanswer, answerid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({ message: "answer unavailable" });
  }
  
  try {
    const questionDoc = await question.findById(_id);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    const ans = questionDoc.answer.id(answerid);
    if (!ans) return res.status(404).json({ message: "Answer not found" });

    const currentUser = await User.findById(req.userid);
    const isOwner = ans.userid === String(req.userid);
    const isAdmin = currentUser && currentUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this answer" });
    }

    const penalty = (isAdmin && !isOwner) ? -10 : -5;
    const penaltyReason = (isAdmin && !isOwner)
      ? "Answer removed by administrator due to guideline violations"
      : "Answer deleted by user";
    const penaltyType = (isAdmin && !isOwner) ? "admin_removal" : "answer_deleted";

    let netReversion = penalty - 5; // penalty + revert posting bonus (+5)
    if (ans.isAccepted) netReversion -= 10;
    if (ans.upvotesRewardAwarded) netReversion -= 5;
    netReversion += (ans.downvote?.length || 0) * 2;

    if (ans.userid) {
      await updateReputation(ans.userid, netReversion, penaltyReason, penaltyType);
    }

    updatenoofanswer(_id, noofanswer);

    const updatequestion = await question.updateOne(
      { _id },
      {
        $pull: { answer: { _id: answerid } },
      }
    );
    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const voteAnswer = async (req, res) => {
  const { questionId, answerId } = req.params;
  const { value } = req.body;
  const userid = req.userid;

  if (!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  try {
    const questionDoc = await question.findById(questionId);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    const ans = questionDoc.answer.id(answerId);
    if (!ans) return res.status(404).json({ message: "Answer not found" });

    if (!ans.upvote) ans.upvote = [];
    if (!ans.downvote) ans.downvote = [];

    const upindex = ans.upvote.findIndex((id) => id === String(userid));
    const downindex = ans.downvote.findIndex((id) => id === String(userid));

    let downvoteChange = 0;

    if (value === "upvote") {
      if (downindex !== -1) {
        ans.downvote = ans.downvote.filter((id) => id !== String(userid));
        downvoteChange += 1;
      }
      if (upindex === -1) {
        ans.upvote.push(userid);
      } else {
        ans.upvote = ans.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        ans.upvote = ans.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        ans.downvote.push(userid);
        downvoteChange -= 1;
      } else {
        ans.downvote = ans.downvote.filter((id) => id !== String(userid));
        downvoteChange += 1;
      }
    }

    // Check 5 upvotes reward for answerer
    let upvoteRewardChange = 0;
    if (ans.upvote.length >= 5 && !ans.upvotesRewardAwarded) {
      ans.upvotesRewardAwarded = true;
      upvoteRewardChange = 5;
    } else if (ans.upvote.length < 5 && ans.upvotesRewardAwarded) {
      ans.upvotesRewardAwarded = false;
      upvoteRewardChange = -5;
    }

    const answererId = ans.userid;

    // Apply downvote reputation change
    if (downvoteChange !== 0 && answererId) {
      const change = downvoteChange * 2;
      const reason = change < 0 ? "Received a downvote on answer" : "Revoked downvote on answer";
      const type = change < 0 ? "downvote_received" : "downvote_removed";
      await updateReputation(answererId, change, reason, type);
    }

    // Apply upvote reward change
    if (upvoteRewardChange !== 0 && answererId) {
      const reason = upvoteRewardChange > 0
        ? "Answer received 5 or more upvotes"
        : "Answer fell below 5 upvotes";
      const type = "answer_5_upvotes";
      await updateReputation(answererId, upvoteRewardChange, reason, type);
    }

    await questionDoc.save();
    return res.status(200).json({ data: questionDoc });
  } catch (error) {
    console.error("Answer voting failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const acceptAnswer = async (req, res) => {
  const { questionId, answerId } = req.params;
  const userid = req.userid;

  if (!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  try {
    const questionDoc = await question.findById(questionId);
    if (!questionDoc) return res.status(404).json({ message: "Question not found" });

    if (questionDoc.userid !== String(userid)) {
      return res.status(403).json({ message: "Only the question author can accept answers" });
    }

    const ansToAccept = questionDoc.answer.id(answerId);
    if (!ansToAccept) return res.status(404).json({ message: "Answer not found" });

    const wasAccepted = ansToAccept.isAccepted || false;

    // Unaccept other answers
    for (const otherAns of questionDoc.answer) {
      if (otherAns.isAccepted && String(otherAns._id) !== String(answerId)) {
        otherAns.isAccepted = false;
        if (otherAns.userid) {
          await updateReputation(
            otherAns.userid,
            -10,
            "Answer unmarked as accepted",
            "answer_unaccepted"
          );
        }
      }
    }

    ansToAccept.isAccepted = !wasAccepted;

    if (ansToAccept.isAccepted) {
      if (ansToAccept.userid) {
        await updateReputation(
          ansToAccept.userid,
          10,
          "Answer marked as the accepted answer",
          "answer_accepted"
        );
      }
    } else {
      if (ansToAccept.userid) {
        await updateReputation(
          ansToAccept.userid,
          -10,
          "Answer unmarked as accepted",
          "answer_unaccepted"
        );
      }
    }

    await questionDoc.save();
    return res.status(200).json({ data: questionDoc });
  } catch (error) {
    console.error("Accept answer failed:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
