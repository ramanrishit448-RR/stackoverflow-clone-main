import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  History,
  Share,
  Trash,
  Check,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";

const QuestionDetail = ({ questionId }: any) => {
  const router = useRouter();
  const [question, setquestion] = useState<any>(null);
  const [answer, setanswer] = useState<any>();
  const [newanswer, setnewAnswer] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);
  const [loading, setloading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const matchedquestion = res.data.data.find(
          (u: any) => u._id === questionId
        );
        if (matchedquestion) {
          const bookmarkedIds = JSON.parse(localStorage.getItem("bookmarked_questions") || "[]");
          matchedquestion.isBookmarked = bookmarkedIds.includes(matchedquestion._id);
          setanswer(matchedquestion.answer);
          setquestion(matchedquestion);
        } else {
          setquestion(null);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [questionId]);
  if (loading) {
    return (
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    );
  }
  if (!question) {
    return (
      <div className="text-center text-gray-500 mt-4">No question found.</div>
    );
  }

  const handleVote = async (vote: String) => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    try {
      const res = await axiosInstance.patch(`/question/vote/${question._id}`, {
        value: vote,
        userid: user?._id,
      });
      if (res.data.data) {
        setquestion(res.data.data);
        toast.success("Vote Updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to Vote question");
    }
  };
  const handlebookmark = () => {
    if (!question) return;
    const bookmarkedIds = JSON.parse(localStorage.getItem("bookmarked_questions") || "[]");
    let isBookmarked = false;
    let newIds = [];
    if (bookmarkedIds.includes(question._id)) {
      newIds = bookmarkedIds.filter((id: string) => id !== question._id);
      isBookmarked = false;
      toast.info("Question removed from saves");
    } else {
      newIds = [...bookmarkedIds, question._id];
      isBookmarked = true;
      toast.success("Question saved successfully");
    }
    localStorage.setItem("bookmarked_questions", JSON.stringify(newIds));
    setquestion((prev: any) => ({ ...prev, isBookmarked }));
  };
  const handleSubmitanswer = async () => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    if (!newanswer.trim()) return;
    setisSubmitting(true);
    try {
      const res = await axiosInstance.post(
        `/answer/postanswer/${question?._id}`,
        {
          noofanswer: question.noofanswer + 1,
          answerbody: newanswer,
          useranswered: user.name,
          userid: user._id,
        }
      );
      if (res.data.data) {
        setquestion(res.data.data);
        setanswer(res.data.data.answer);
        toast.success("Answer Uploaded");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to Answer");
    } finally {
      setnewAnswer("");
      setisSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      const res = await axiosInstance.delete(
        `/question/delete/${question._id}`
      );
      if (res.data.message) {
        toast.success(res.data.message);
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };
  const handleDeleteanswer = async (id: String) => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    if (!window.confirm("Are you sure you want to delete this answer?"))
      return;
    try {
      const res = await axiosInstance.delete(`/answer/delete/${question._id}`, {
        data: {
          noofanswer: question.noofanswer,
          answerid: id,
        },
      });
      if (res.data.data) {
        const updateanswer = question.answer.filter(
          (ans: any) => ans._id !== id
        );
        setquestion((prev: any) => ({
          ...prev,
          noofanswer: updateanswer.length,
          answer: updateanswer,
        }));
        toast.success("deleted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };
  const handleAnswerVote = async (answerId: string, vote: string) => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/answer/vote/${question._id}/${answerId}`, {
        value: vote
      });
      if (res.data.data) {
        setquestion(res.data.data);
        setanswer(res.data.data.answer);
        toast.success("Answer Vote Updated");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to vote answer");
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/answer/accept/${question._id}/${answerId}`);
      if (res.data.data) {
        setquestion(res.data.data);
        setanswer(res.data.data.answer);
        toast.success("Accepted Answer Updated");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to accept answer");
    }
  };

  const handleCloseQuestion = async () => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    if (!window.confirm("Are you sure you want to vote to close this question?")) return;
    try {
      const res = await axiosInstance.patch(`/question/close/${question._id}`);
      if (res.data.data) {
        setquestion(res.data.data);
        toast.success(res.data.message || "Close vote registered");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to close question");
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Question Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-4 text-gray-900">
          {question.questiontitle}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Asked {new Date(question.askedon).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Voting Section */}
            <div className="flex sm:flex-col items-center sm:items-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${"text-gray-600 hover:text-orange-500"}`}
                onClick={() => handleVote("upvote")}
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
              <span>{question.upvote.length - question.downvote.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${"text-gray-600 hover:text-orange-500"}`}
                onClick={() => handleVote("downvote")}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
              <div className="flex sm:flex-col gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${
                    question?.isBookmarked
                      ? "text-yellow-500"
                      : "text-gray-600 hover:text-yellow-500"
                  }`}
                  onClick={handlebookmark}
                >
                  <Bookmark
                    className="w-5 h-5"
                    fill={question?.isBookmarked ? "currentColor" : "none"}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  <History className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 sm:p-6">
              {question.isClosed && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 rounded-r-lg">
                  <p className="text-orange-800 text-sm font-semibold">
                    Closed by community vote. No new answers can be posted.
                  </p>
                </div>
              )}
              <div className="prose max-w-none mb-6">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: question.questionbody
                      .replace(
                        /## (.*)/g,
                        '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>'
                      )
                      .replace(
                        /```(\w+)?\n([\s\S]*?)```/g,
                        '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>'
                      )
                      .replace(
                        /`([^`]+)`/g,
                        '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
                      )
                      .replace(/\n\n/g, '</p><p class="mb-4">')
                      .replace(/^/, '<p class="mb-4">')
                      .replace(/$/, "</p>")
                      .replace(
                        /\n(\d+\. .*)/g,
                        '<ol class="list-decimal list-inside my-4"><li>$1</li></ol>'
                      ),
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {question.questiontags.map((tag: any) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Flag
                  </Button>
                  {question.userid === user?._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                  {user && !question.isClosed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseQuestion}
                      className="text-orange-600 hover:text-orange-800"
                      title="Vote to close this question"
                    >
                      <Flag className="w-4 h-4 mr-1" />
                      Vote to Close ({question.closeVotes?.length || 0}/3)
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    asked {new Date(question.askedon).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/users/${question.userid}`}
                    className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm">
                        {question.userposted[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        {question.userposted}
                        {question.userPlan === "gold" && <span className="text-yellow-500 font-bold text-xs" title="Gold Member">★ Gold</span>}
                        {question.userPlan === "silver" && <span className="text-slate-400 font-bold text-xs" title="Silver Member">★ Silver</span>}
                        {question.userPlan === "bronze" && <span className="text-amber-700 font-bold text-xs" title="Bronze Member">★ Bronze</span>}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {question.answer.length} Answer
          {question.answer.length !== 1 ? "s" : ""}
        </h2>
        <div className="space-y-6">
          {question.answer.map((ans: any) => (
            <Card key={ans._id} className={""}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Answer Voting & Acceptance Column */}
                  <div className="flex sm:flex-col items-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-600 hover:text-orange-500"
                      onClick={() => handleAnswerVote(ans._id, "upvote")}
                    >
                      <ChevronUp className="w-6 h-6" />
                    </Button>
                    <span className="font-bold text-gray-800">{(ans.upvote?.length || 0) - (ans.downvote?.length || 0)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-600 hover:text-orange-500"
                      onClick={() => handleAnswerVote(ans._id, "downvote")}
                    >
                      <ChevronDown className="w-6 h-6" />
                    </Button>
                    <div className="mt-4">
                      {question.userid === user?._id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-2 rounded-full ${
                            ans.isAccepted
                              ? "text-green-600 bg-green-50 hover:bg-green-100"
                              : "text-gray-400 hover:text-green-600"
                          }`}
                          onClick={() => handleAcceptAnswer(ans._id)}
                          title="Toggle Accept Answer"
                        >
                          <Check className="w-6 h-6" />
                        </Button>
                      ) : (
                        ans.isAccepted && (
                          <div className="p-2 text-green-600 bg-green-50 rounded-full" title="Accepted Answer">
                            <Check className="w-6 h-6" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  {/* Answer Content */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="prose max-w-none mb-6">
                      <div
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: ans.answerbody
                            .replace(
                              /## (.*)/g,
                              '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>'
                            )
                            .replace(
                              /```(\w+)?\n([\s\S]*?)```/g,
                              '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>'
                            )
                            .replace(
                              /`([^`]+)`/g,
                              '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
                            )
                            .replace(/\n\n/g, '</p><p class="mb-4">')
                            .replace(/^/, '<p class="mb-4">')
                            .replace(/$/, "</p>")
                            .replace(
                              /\n(\d+\. .*)/g,
                              '<ol class="list-decimal list-inside my-4"><li>$1</li></ol>'
                            ),
                        }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Share className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                        {ans.userid === user?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteanswer(ans._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">
                          answered {new Date(ans.answeredon).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/users/${ans.userid}`}
                          className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-sm">
                              {ans.useranswered[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-blue-600 hover:text-blue-800 font-medium">
                              {ans.useranswered}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {!question.isClosed ? (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Your Answer
            </h3>
            <Textarea
              placeholder="Write your answer here... You can use Markdown formatting."
              value={newanswer}
              onChange={(e) => setnewAnswer(e.target.value)}
              className="min-h-32 mb-4 resize-none"
            />
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button
                onClick={handleSubmitanswer}
                disabled={!newanswer.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Posting..." : "Post Your Answer"}
              </Button>
              <p className="text-sm text-gray-600">
                By posting your answer, you agree to the{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  privacy policy
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  terms of service
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-gray-500 py-8 border border-dashed border-gray-300 rounded-2xl bg-gray-50 font-medium">
          This question is closed. It cannot accept any new answers.
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;
