import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import PostCard from "@/components/feed/PostCard";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { Badge } from "@/components/ui/badge";

export default function HashtagPage() {
  const router = useRouter();
  const tag = router.query.tag as string;
  const { posts, loading, loadingMore, hasMore, sentinelRef, updatePost, removePost } =
    useInfiniteFeed("hashtag", tag);

  if (!tag) return null;

  return (
    <Mainlayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Badge className="text-lg px-3 py-1 bg-orange-500">#{tag}</Badge>
          <p className="text-sm text-gray-500 mt-2">Posts tagged with #{tag}</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">No posts with this hashtag yet.</p>
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
            {!hasMore && (
              <p className="text-center text-sm text-gray-400 py-4">End of results</p>
            )}
          </>
        )}
      </div>
    </Mainlayout>
  );
}
