const { comments, posts } = require("../data/mockData");
const userModel = require("./userModel");

function enrichComment(comment) {
  const author = userModel.findById(comment.authorId);
  return {
    ...comment,
    author: {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatar: author.avatar,
    },
  };
}

function getByPostId(postId) {
  return comments
    .filter((c) => c.postId === postId)
    .map(enrichComment);
}

function create(postId, authorId, text) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return { error: "post_not_found" };

  if (!text || !text.trim()) return { error: "text_required" };

  const newComment = {
    id: comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1,
    postId,
    authorId,
    text: text.trim(),
    likes: [],
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  return { comment: enrichComment(newComment) };
}

function deleteComment(commentId, userId) {
  const index = comments.findIndex((c) => c.id === commentId);
  if (index === -1) return { error: "not_found" };

  const comment = comments[index];
  const post = posts.find((p) => p.id === comment.postId);

  // Allow deletion by comment author or post owner
  if (comment.authorId !== userId && (!post || post.authorId !== userId)) {
    return { error: "forbidden" };
  }

  comments.splice(index, 1);
  return { success: true };
}

function toggleLike(commentId, userId) {
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return { error: "not_found" };

  const likeIndex = comment.likes.indexOf(userId);
  if (likeIndex >= 0) {
    comment.likes.splice(likeIndex, 1);
  } else {
    comment.likes.push(userId);
  }

  return { comment: enrichComment(comment) };
}

module.exports = { getByPostId, create, deleteComment, toggleLike };
