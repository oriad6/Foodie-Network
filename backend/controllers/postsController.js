const postModel = require("../models/postModel");

async function getPosts(req, res) {
  const posts = await postModel.findAll(req.query.category);
  res.json(posts);
}

async function getPostById(req, res) {
  const post = await postModel.findByIdEnriched(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

async function toggleLike(req, res) {
  const post = await postModel.toggleLike(req.params.id, req.userId);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

async function setRating(req, res) {
  const { score } = req.body;
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  const post = await postModel.setRating(req.params.id, req.userId, score);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

module.exports = { getPosts, getPostById, toggleLike, setRating };
