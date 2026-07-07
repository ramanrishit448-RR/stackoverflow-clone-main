import { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft, Heart, MessageSquare, BookOpen, Send, Calendar } from "lucide-react";

export default function ArticleDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const fetchArticle = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/articles/${id}`);
      setArticle(res.data.data);
      if (user) {
        setIsLiked(res.data.data.likes.includes(user._id));
      }
    } catch (error: any) {
      console.error("Error fetching article details:", error);
      toast.error("Failed to load article details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      toast.info("Please login to like this article.");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.post(`/articles/${id}/like`);
      setArticle(res.data.data);
      setIsLiked(res.data.data.likes.includes(user._id));
      toast.success(res.data.data.likes.includes(user._id) ? "Liked article!" : "Unliked article");
    } catch (error: any) {
      toast.error("Failed to update like status.");
    }
  };

  const handleCommentSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to comment.");
      router.push("/auth");
      return;
    }
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await axiosInstance.post(`/articles/${id}/comment`, {
        content: commentContent,
      });
      setArticle(res.data.data);
      setCommentContent("");
      toast.success("Comment posted successfully!");
    } catch (error: any) {
      toast.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </Mainlayout>
    );
  }

  if (!article) {
    return (
      <Mainlayout>
        <div className="mx-auto max-w-2xl text-center space-y-4 py-12">
          <h2 className="text-xl font-bold text-gray-900">Article not found</h2>
          <button
            onClick={() => router.push("/articles")}
            className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition"
          >
            Back to Articles
          </button>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="mx-auto max-w-4xl space-y-8 pb-12">
        {/* Back navigation */}
        <button
          onClick={() => router.push("/articles")}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </button>

        {/* Article Cover & Header */}
        <div className="space-y-6">
          {article.coverImage && (
            <div className="overflow-hidden rounded-3xl h-64 sm:h-80 md:h-96 w-full bg-gray-100 shadow-sm border border-gray-100">
              <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                {article.category}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> {article.readTime}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl leading-tight">
              {article.title}
            </h1>

            {/* Author Profile Card */}
            <div className="flex items-center justify-between border-y border-gray-100 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                  {article.authorName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{article.authorName}</div>
                  <div className="text-[10px] text-gray-500">Author & Tech Advocate</div>
                </div>
              </div>

              {/* Likes counter indicator */}
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isLiked
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${isLiked ? "fill-current text-red-500" : ""}`} />
                {article.likes?.length || 0} Likes
              </button>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="prose prose-orange max-w-none text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
          {article.content}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
          {article.tags?.map((tag: string) => (
            <span
              key={tag}
              className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-600 font-mono hover:bg-gray-200 transition cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-bold text-gray-900">Comments ({article.comments?.length || 0})</h2>
          </div>

          {/* New Comment Submission Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
              {user ? user.name?.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                rows={3}
                placeholder={user ? "Write a comment..." : "Please log in to write a comment."}
                disabled={!user}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 disabled:bg-gray-50 transition"
              />
              {user && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#ef8236] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#d96e24] disabled:opacity-50 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Comment
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Comment Threads */}
          <div className="space-y-4">
            {article.comments && article.comments.length > 0 ? (
              article.comments.map((comment: any, idx: number) => (
                <div key={idx} className="flex gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 text-xs">
                  <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">
                    {comment.authorName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{comment.authorName}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-normal">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-6">No comments yet. Start the conversation!</p>
            )}
          </div>
        </div>
      </div>
    </Mainlayout>
  );
}
