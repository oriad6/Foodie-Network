const commentModel = require("../models/commentModel");

async function getComments(req, res) {
  const comments = await commentModel.getByPostId(req.params.postId);
  res.json(comments);
}

async function createComment(req, res) {
  const { text } = req.body;
  const result = await commentModel.create(req.params.postId, req.userId, text);

  if (result.error === "post_not_found") return res.status(404).json({ error: "Post not found." });
  if (result.error === "text_required") return res.status(400).json({ error: "Comment text is required." });

  res.status(201).json(result.comment);
}

async function deleteComment(req, res) {
  const result = await commentModel.deleteComment(req.params.commentId, req.userId);

  if (result.error === "not_found") return res.status(404).json({ error: "Comment not found." });
  if (result.error === "forbidden") return res.status(403).json({ error: "Not authorized to delete this comment." });

  res.json({ success: true });
}

async function toggleLike(req, res) {
  const result = await commentModel.toggleLike(req.params.commentId, req.userId);

  if (result.error === "not_found") return res.status(404).json({ error: "Comment not found." });

  res.json(result.comment);
}

module.exports = { getComments, createComment, deleteComment, toggleLike };
