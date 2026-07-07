import { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { Search, Heart, MessageSquare, BookOpen, PlusCircle } from "lucide-react";

const CATEGORIES = ["All", "Web Development", "Data Science", "DevOps", "AI / ML", "Career"];

export default function ArticlesIndex() {
  const { user } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== "All" ? `&category=${selectedCategory}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await axiosInstance.get(`/articles?${categoryParam}${searchParam}`);
      setArticles(res.data.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleWriteArticle = () => {
    if (!user) {
      router.push("/auth");
    } else {
      router.push("/articles/new");
    }
  };

  return (
    <Mainlayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 shadow-sm">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
              Developer Articles & Guides
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Write, share, and discover technical knowledge.
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Explore in-depth tutorials, architectural reviews, engineering insights, and career growth stories written by developers in the community.
            </p>
            <div className="mt-6">
              <button
                onClick={handleWriteArticle}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 hover:shadow transition-all duration-200"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                Write an Article
              </button>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute right-0 bottom-0 top-0 hidden w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200/40 via-amber-100/20 to-transparent md:block" />
        </section>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 ${
                  selectedCategory === cat
                    ? "bg-[#ef8236] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No articles found</h3>
            <p className="mt-2 text-xs text-gray-500">
              Be the first to share technical knowledge in this category!
            </p>
            <div className="mt-6">
              <button
                onClick={handleWriteArticle}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition"
              >
                Write the first article
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: any) => (
              <article
                key={article._id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200"
              >
                <Link href={`/articles/${article._id}`} className="block overflow-hidden h-44 bg-gray-100">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 p-6 text-center text-white font-bold leading-tight group-hover:opacity-95 transition">
                      {article.title}
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-600">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 line-clamp-2 hover:text-orange-500 transition">
                    <Link href={`/articles/${article._id}`}>{article.title}</Link>
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-3">
                    {article.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {article.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-orange-600 text-white font-semibold text-[10px] flex items-center justify-center">
                        {article.authorName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700 truncate max-w-[100px]">{article.authorName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-400 fill-current" /> {article.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> {article.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
