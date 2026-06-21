const User = require("../schemas/User");
const Post = require("../schemas/Post");

async function findById(id) {
  return User.findById(id).lean();
}

async function getProfile(id) {
  const user = await User.findById(id).lean();
  if (!user) return null;

  const posts = await Post.find({ authorId: user._id }).lean();
  return { ...user, id: user._id, posts };
}

async function search(query) {
  const regex = new RegExp(query, "i");
  return User.find({
    $or: [{ username: regex }, { displayName: regex }],
  }).lean();
}

module.exports = { findById, getProfile, search };
