const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const categoryModel = require("../models/categoryModel");

async function search(req, res) {
  const { q } = req.query;
  if (!q) return res.json({ users: [], posts: [], categories: [] });

  const [users, posts, categories] = await Promise.all([
    userModel.search(q),
    postModel.search(q),
    categoryModel.search(q),
  ]);

  res.json({ users, posts, categories });
}

module.exports = { search };
