export const extractHashtags = (text = "") => {
  const matches = text.match(/#[\w-]+/g) || [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};

export const computeEngagementScore = (post) => {
  const likes = post.likes?.length || 0;
  const comments = post.commentCount || 0;
  const shares = post.shareCount || 0;
  const hoursSince =
    (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  const recencyBoost = Math.max(0, 48 - hoursSince) / 48;
  return likes * 2 + comments * 3 + shares + recencyBoost * 10;
};

export const formatPost = (post, userId) => {
  const doc = post.toObject ? post.toObject() : post;
  const uid = userId?.toString();
  return {
    _id: doc._id,
    authorId: doc.authorId,
    authorName: doc.authorName,
    type: doc.type,
    content: doc.content,
    codeSnippet: doc.codeSnippet,
    codeLanguage: doc.codeLanguage,
    projectUrl: doc.projectUrl,
    projectTitle: doc.projectTitle,
    images: doc.images || [],
    hashtags: doc.hashtags || [],
    likeCount: doc.likes?.length || 0,
    commentCount: doc.commentCount || 0,
    shareCount: doc.shareCount || 0,
    engagementScore: doc.engagementScore || 0,
    likedByMe: uid ? doc.likes?.some((id) => id.toString() === uid) : false,
    bookmarkedByMe: uid
      ? doc.bookmarks?.some((id) => id.toString() === uid)
      : false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export const createNotification = async ({
  recipientId,
  actorId,
  actorName,
  type,
  postId,
  commentId,
  message,
}) => {
  if (recipientId?.toString() === actorId?.toString()) return;

  const Notification = (await import("../models/notification.js")).default;
  await Notification.create({
    recipientId,
    actorId,
    actorName,
    type,
    postId,
    commentId,
    message,
  });
};

export const parseMentions = (text = "") => {
  const matches = text.match(/@([\w-]+)/g) || [];
  return matches.map((m) => m.slice(1));
};
