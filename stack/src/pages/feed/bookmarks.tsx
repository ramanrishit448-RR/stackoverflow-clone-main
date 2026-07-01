import Mainlayout from "@/layout/Mainlayout";
import PostCard from "@/components/feed/PostCard";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { posts, loading, loadingMore, hasMore, sentinelRef, updatePost, removePost } =
    useInfiniteFeed("bookmarks");

  useEffect(() => {
    if (!user) router.push("/auth");
  }, [user, router]);

  return (
    <Mainlayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-800">Saved Posts</h1>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading bookmarks...</p>
        ) : posts.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">
              No saved posts yet. Bookmark posts from the feed to find them here.
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
          </>
        )}
      </div>
    </Mainlayout>
  );
}
