const postModel = require("../models/postModel");
const { CURRENT_USER_ID } = require("../config/constants");

function getPosts(req, res) {
  res.json(postModel.findAll(req.query.category));
}

function getPostById(req, res) {
  const post = postModel.findByIdEnriched(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

function toggleLike(req, res) {
  const post = postModel.toggleLike(req.params.id, CURRENT_USER_ID);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

function setRating(req, res) {
  const { score } = req.body;
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  const post = postModel.setRating(req.params.id, CURRENT_USER_ID, score);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

module.exports = { getPosts, getPostById, toggleLike, setRating };
