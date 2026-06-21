const Comment = require("../schemas/Comment");
const Post = require("../schemas/Post");
const User = require("../schemas/User");

async function enrichComment(comment) {
  const author = await User.findById(comment.authorId).lean();
  return {
    ...comment,
    id: comment._id,
    createdAt: comment.createdAt || comment._id.getTimestamp().toISOString(),
    author: {
      id: author._id,
      username: author.username,
      displayName: author.displayName,
      avatar: author.avatar,
    },
  };
}

async function getByPostId(postId) {
  const comments = await Comment.find({ postId }).lean();
  return Promise.all(comments.map(enrichComment));
}

async function create(postId, authorId, text) {
  const post = await Post.findById(postId);
  if (!post) return { error: "post_not_found" };
  if (!text || !text.trim()) return { error: "text_required" };

  const comment = await Comment.create({
    postId,
    authorId,
    text: text.trim(),
  });
  return { comment: await enrichComment(comment.toObject()) };
}

async function deleteComment(commentId, userId) {
  const comment = await Comment.findById(commentId);
  if (!comment) return { error: "not_found" };

  const post = await Post.findById(comment.postId);

  if (!comment.authorId.equals(userId) && (!post || !post.authorId.equals(userId))) {
    return { error: "forbidden" };
  }

  await Comment.findByIdAndDelete(commentId);
  return { success: true };
}

async function toggleLike(commentId, userId) {
  const comment = await Comment.findById(commentId);
  if (!comment) return { error: "not_found" };

  const likeIndex = comment.likes.findIndex((lid) => lid.equals(userId));
  if (likeIndex >= 0) {
    comment.likes.splice(likeIndex, 1);
  } else {
    comment.likes.push(userId);
  }
  await comment.save();
  return { comment: await enrichComment(comment.toObject()) };
}

module.exports = { getByPostId, create, deleteComment, toggleLike };
