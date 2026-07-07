import { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft, BookOpen, Send, Sparkles } from "lucide-react";

const CATEGORIES = ["Web Development", "Data Science", "DevOps", "AI / ML", "Career"];

export default function CreateArticle() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [readTime, setReadTime] = useState("3 min read");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to write an article.");
      router.push("/auth");
    }
  }, [user]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const parsedTags = tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [];

      const res = await axiosInstance.post("/articles", {
        title,
        content,
        category,
        tags: parsedTags,
        coverImage,
        readTime,
      });

      toast.success("Article published successfully!");
      router.push(`/articles/${res.data.data._id}`);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to publish article.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/articles")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Articles
          </button>
          <span className="text-xs text-gray-400 font-mono">Draft Auto-Saved</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Create New Article</h1>
              <p className="text-xs text-gray-500">Publish a guide, review, or tutorial for the community.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-gray-700">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Mastering React Server Components"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-xs font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="readTime" className="text-xs font-semibold text-gray-700">
                  Estimated Read Time
                </label>
                <select
                  id="readTime"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                >
                  <option value="2 min read">2 min read</option>
                  <option value="3 min read">3 min read</option>
                  <option value="5 min read">5 min read</option>
                  <option value="8 min read">8 min read</option>
                  <option value="12 min read">12 min read</option>
                  <option value="15+ min read">15+ min read</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="coverImage" className="text-xs font-semibold text-gray-700">
                Cover Image URL
              </label>
              <input
                id="coverImage"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              />
              <p className="text-[10px] text-gray-400">Optional. Provide an image URL to show at the top of the article.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-xs font-semibold text-gray-700">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                placeholder="react, frontend, nextjs (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="content" className="text-xs font-semibold text-gray-700">
                Article Body <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                rows={12}
                placeholder="Write your article here. Share your ideas, steps, and code snippets..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef8236] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d96e24] disabled:opacity-50 transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                {loading ? "Publishing..." : "Publish Article"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Mainlayout>
  );
}
