const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const categoryModel = require("../models/categoryModel");

function search(req, res) {
  const { q } = req.query;
  if (!q) return res.json({ users: [], posts: [], categories: [] });

  res.json({
    users: userModel.search(q),
    posts: postModel.search(q),
    categories: categoryModel.search(q),
  });
}

module.exports = { search };
