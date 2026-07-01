import { useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import CommentSection from "./CommentSection";
import {
  Bookmark,
  Code2,
  ExternalLink,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  Trophy,
} from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  update: "Update",
  code: "Code Snippet",
  image: "Image",
  project: "Project",
  achievement: "Achievement",
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function PostCard({
  post,
  onUpdate,
  onDelete,
}: {
  post: any;
  onUpdate?: (id: string, updates: any) => void;
  onDelete?: (id: string) => void;
}) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [reportReason, setReportReason] = useState("");
  const [localPost, setLocalPost] = useState(post);

  const isOwner = user?._id === localPost.authorId;

  const handleLike = async () => {
    if (!user) return toast.error("Log in to like posts");
    try {
      const res = await axiosInstance.post(`/feed/${localPost._id}/like`);
      const updates = {
        likeCount: res.data.data.likeCount,
        likedByMe: res.data.data.likedByMe,
      };
      setLocalPost((p: any) => ({ ...p, ...updates }));
      onUpdate?.(localPost._id, updates);
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleBookmark = async () => {
    if (!user) return toast.error("Log in to bookmark posts");
    try {
      const res = await axiosInstance.post(`/feed/${localPost._id}/bookmark`);
      const updates = { bookmarkedByMe: res.data.data.bookmarkedByMe };
      setLocalPost((p: any) => ({ ...p, ...updates }));
      onUpdate?.(localPost._id, updates);
      toast.info(updates.bookmarkedByMe ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Failed to bookmark");
    }
  };

  const handleShare = async () => {
    try {
      await axiosInstance.post(`/feed/${localPost._id}/share`);
      const url = `${window.location.origin}/feed?post=${localPost._id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
      setLocalPost((p: any) => ({ ...p, shareCount: (p.shareCount || 0) + 1 }));
    } catch {
      toast.error("Failed to share");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await axiosInstance.delete(`/feed/${localPost._id}`);
      toast.success("Post deleted");
      onDelete?.(localPost._id);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = async () => {
    try {
      const res = await axiosInstance.patch(`/feed/${localPost._id}`, {
        content: editContent,
      });
      setLocalPost(res.data.data);
      onUpdate?.(localPost._id, res.data.data);
      setEditOpen(false);
      toast.success("Post updated");
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return toast.error("Please provide a reason");
    try {
      await axiosInstance.post(`/feed/${localPost._id}/report`, {
        reason: reportReason,
      });
      setReportOpen(false);
      setReportReason("");
      toast.success("Report submitted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to report");
    }
  };

  return (
    <article className="bg-white border rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href={`/users/${localPost.authorId}`}>
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-orange-500 text-white">
                  {localPost.authorName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                href={`/users/${localPost.authorId}`}
                className="font-semibold text-sm hover:text-orange-600"
              >
                {localPost.authorName}
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{timeAgo(localPost.createdAt)}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {TYPE_LABELS[localPost.type] || localPost.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-10 py-1">
                {isOwner && (
                  <>
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        setEditOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      onClick={() => {
                        handleDelete();
                        setMenuOpen(false);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
                {!isOwner && user && (
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    onClick={() => {
                      setReportOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    <Flag className="w-3.5 h-3.5" /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {localPost.type === "achievement" && (
          <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Learning achievement</span>
          </div>
        )}

        <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{localPost.content}</p>

        {localPost.codeSnippet && (
          <div className="mt-3 rounded-lg overflow-hidden border">
            <div className="bg-gray-800 px-3 py-1.5 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-300">
                {localPost.codeLanguage || "code"}
              </span>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 text-xs overflow-x-auto">
              <code>{localPost.codeSnippet}</code>
            </pre>
          </div>
        )}

        {localPost.projectTitle && (
          <a
            href={localPost.projectUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition"
          >
            <ExternalLink className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">
              {localPost.projectTitle}
            </span>
          </a>
        )}

        {localPost.images?.length > 0 && (
          <div className="mt-3 grid gap-2">
            {localPost.images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt="Post"
                className="rounded-lg max-h-80 w-full object-cover border"
              />
            ))}
          </div>
        )}

        {localPost.hashtags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {localPost.hashtags.map((tag: string) => (
              <Link key={tag} href={`/feed/hashtag/${tag}`}>
                <Badge
                  variant="outline"
                  className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1.5 ${localPost.likedByMe ? "text-red-500" : "text-gray-600"}`}
            >
              <Heart className={`w-4 h-4 ${localPost.likedByMe ? "fill-current" : ""}`} />
              {localPost.likeCount || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-1.5 text-gray-600"
            >
              <MessageCircle className="w-4 h-4" />
              {localPost.commentCount || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-gray-600"
            >
              <Share2 className="w-4 h-4" />
              {localPost.shareCount || 0}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={localPost.bookmarkedByMe ? "text-orange-500" : "text-gray-600"}
          >
            <Bookmark className={`w-4 h-4 ${localPost.bookmarkedByMe ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {showComments && <CommentSection postId={localPost._id} />}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[120px]"
          />
          <Button onClick={handleEdit} className="bg-orange-500 hover:bg-orange-600">
            Save changes
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report post</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Reason for reporting..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <Button onClick={handleReport} variant="destructive">
            Submit report
          </Button>
        </DialogContent>
      </Dialog>
    </article>
  );
}
