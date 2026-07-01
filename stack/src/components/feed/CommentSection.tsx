import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import { Heart, Trash2 } from "lucide-react";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function CommentItem({
  comment,
  postId,
  onRefresh,
  isReply = false,
}: {
  comment: any;
  postId: string;
  onRefresh: () => void;
  isReply?: boolean;
}) {
  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(comment.likedByMe);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);

  const handleLike = async () => {
    if (!user) return toast.error("Log in to like comments");
    try {
      const res = await axiosInstance.post(`/feed/comments/${comment._id}/like`);
      setLiked(res.data.data.likedByMe);
      setLikeCount(res.data.data.likeCount);
    } catch {
      toast.error("Failed to like comment");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await axiosInstance.post(`/feed/${postId}/comments`, {
        content: replyText,
        parentId: comment._id,
      });
      setReplyText("");
      setReplyOpen(false);
      onRefresh();
      toast.success("Reply posted");
    } catch {
      toast.error("Failed to reply");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/feed/comments/${comment._id}`);
      onRefresh();
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className={`${isReply ? "ml-8 mt-2" : "mt-3"}`}>
      <div className="flex gap-2">
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarFallback className="bg-gray-200 text-xs">
            {comment.authorName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{comment.authorName}</span>
            <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs ${liked ? "text-red-500" : "text-gray-500"}`}
            >
              <Heart className={`w-3 h-3 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </button>
            {!isReply && user && (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="text-xs text-gray-500 hover:text-orange-600"
              >
                Reply
              </button>
            )}
            {user?._id === comment.authorId && (
              <button onClick={handleDelete} className="text-xs text-red-500">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {replyOpen && (
        <div className="ml-9 mt-2 flex gap-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button size="sm" onClick={handleReply} className="self-end bg-orange-500">
            Reply
          </Button>
        </div>
      )}

      {comment.replies?.map((reply: any) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          postId={postId}
          onRefresh={onRefresh}
          isReply
        />
      ))}
    </div>
  );
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/feed/${postId}/comments`);
      setComments(res.data.data || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!user) return toast.error("Log in to comment");
    if (!content.trim()) return;
    try {
      await axiosInstance.post(`/feed/${postId}/comments`, { content });
      setContent("");
      fetchComments();
      toast.success("Comment added");
    } catch {
      toast.error("Failed to comment");
    }
  };

  return (
    <div className="border-t bg-gray-50/50 px-4 py-3">
      {user && (
        <div className="flex gap-2 mb-3">
          <Textarea
            placeholder="Add a comment... Use @username to mention"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            className="self-end bg-orange-500 hover:bg-orange-600"
          >
            Post
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
      ) : (
        comments.map((c) => (
          <CommentItem
            key={c._id}
            comment={c}
            postId={postId}
            onRefresh={fetchComments}
          />
        ))
      )}
    </div>
  );
}
