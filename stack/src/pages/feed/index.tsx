import { useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useEffect } from "react";
import { Flame, Users, Globe, TrendingUp } from "lucide-react";

type FeedTab = "all" | "following" | "trending";

export default function FeedPage() {
  const [tab, setTab] = useState<FeedTab>("all");
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const mode = tab === "trending" ? "trending" : tab;
  const { posts, loading, loadingMore, hasMore, sentinelRef, updatePost, removePost, refresh } =
    useInfiniteFeed(mode as any);

  useEffect(() => {
    axiosInstance
      .get("/feed/trending/hashtags")
      .then((res) => setTrendingTags(res.data.data || []))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: "all" as const, label: "For You", icon: Globe },
    { id: "following" as const, label: "Following", icon: Users },
    { id: "trending" as const, label: "Trending", icon: TrendingUp },
  ];

  return (
    <Mainlayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Community Feed</h1>
          <Link href="/feed/bookmarks">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
              Saved posts
            </Badge>
          </Link>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                tab === id
                  ? "bg-orange-500 text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {trendingTags.length > 0 && tab !== "trending" && (
          <div className="bg-white border rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold">Trending hashtags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((t) => (
                <Link key={t.tag} href={`/feed/hashtag/${t.tag}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-orange-100"
                  >
                    #{t.tag} · {t.count}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <PostComposer onCreated={refresh} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">
              {tab === "following"
                ? "Follow community members to see their posts here."
                : "No posts yet. Be the first to share something!"}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={updatePost}
                onDelete={removePost}
              />
            ))}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && (
              <p className="text-center text-sm text-gray-400 py-4">Loading more...</p>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-center text-sm text-gray-400 py-4">You&apos;re all caught up</p>
            )}
          </>
        )}
      </div>
    </Mainlayout>
  );
}
