const { CURRENT_USER_ID } = require("../config/constants");
const commentModel = require("../models/commentModel");

function getComments(req, res) {
  const postId = parseInt(req.params.postId);
  res.json(commentModel.getByPostId(postId));
}

function createComment(req, res) {
  const postId = parseInt(req.params.postId);
  const { text } = req.body;
  const result = commentModel.create(postId, CURRENT_USER_ID, text);

  if (result.error === "post_not_found") return res.status(404).json({ error: "Post not found." });
  if (result.error === "text_required") return res.status(400).json({ error: "Comment text is required." });

  res.status(201).json(result.comment);
}

function deleteComment(req, res) {
  const commentId = parseInt(req.params.commentId);
  const result = commentModel.deleteComment(commentId, CURRENT_USER_ID);

  if (result.error === "not_found") return res.status(404).json({ error: "Comment not found." });
  if (result.error === "forbidden") return res.status(403).json({ error: "Not authorized to delete this comment." });

  res.json({ success: true });
}

function toggleLike(req, res) {
  const commentId = parseInt(req.params.commentId);
  const result = commentModel.toggleLike(commentId, CURRENT_USER_ID);

  if (result.error === "not_found") return res.status(404).json({ error: "Comment not found." });

  res.json(result.comment);
}

module.exports = { getComments, createComment, deleteComment, toggleLike };
