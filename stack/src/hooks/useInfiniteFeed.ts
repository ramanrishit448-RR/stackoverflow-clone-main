import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

type FeedMode = "all" | "following" | "trending" | "hashtag" | "bookmarks";

export function useInfiniteFeed(mode: FeedMode = "all", hashtag?: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getEndpoint = useCallback(
    (pageNum: number) => {
      if (mode === "trending") return `/feed/trending?page=${pageNum}`;
      if (mode === "hashtag" && hashtag)
        return `/feed/hashtag/${hashtag}?page=${pageNum}`;
      if (mode === "bookmarks") return `/feed/bookmarks?page=${pageNum}`;
      if (mode === "following") return `/feed?mode=following&page=${pageNum}`;
      return `/feed?page=${pageNum}`;
    },
    [mode, hashtag]
  );

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await axiosInstance.get(getEndpoint(pageNum));
        const newPosts = res.data.data || [];
        setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
        setHasMore(res.data.pagination?.hasMore ?? false);
        setPage(pageNum);
      } catch {
        if (!append) setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [getEndpoint]
  );

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1);
  }, [mode, hashtag, fetchPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchPage(page + 1, true);
  }, [fetchPage, hasMore, loadingMore, page]);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loadMore, loadingMore]
  );

  const updatePost = useCallback((postId: string, updates: Record<string, unknown>) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updates } : p))
    );
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  const refresh = useCallback(() => fetchPage(1), [fetchPage]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    sentinelRef,
    updatePost,
    removePost,
    refresh,
  };
}
