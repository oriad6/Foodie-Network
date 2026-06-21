const User = require("../schemas/User");
const Post = require("../schemas/Post");

async function findById(id) {
  return User.findById(id).lean();
}

async function getProfile(id) {
  const user = await User.findById(id).lean();
  if (!user) return null;

  const posts = await Post.find({ authorId: user._id }).lean();
  const postsWithId = posts.map((p) => ({ ...p, id: p._id }));
  return { ...user, id: user._id, posts: postsWithId };
}

async function search(query) {
  const regex = new RegExp(query, "i");
  const users = await User.find({
    $or: [{ username: regex }, { displayName: regex }],
  }).lean();
  return users.map((u) => ({ ...u, id: u._id }));
}

module.exports = { findById, getProfile, search };
