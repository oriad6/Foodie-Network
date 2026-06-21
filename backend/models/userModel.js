const User = require("../schemas/User");
const Post = require("../schemas/Post");

function computeAvgRating(posts) {
  const allRatings = posts.flatMap((p) => p.ratings || []);
  if (allRatings.length === 0) return null;
  const sum = allRatings.reduce((acc, r) => acc + r.score, 0);
  return parseFloat((sum / allRatings.length).toFixed(1));
}

async function findById(id) {
  return User.findById(id).lean();
}

async function getProfile(id) {
  const user = await User.findById(id).lean();
  if (!user) return null;

  const posts = await Post.find({ authorId: user._id }).lean();
  const postsWithId = posts.map((p) => ({ ...p, id: p._id }));
  const rating = computeAvgRating(posts);
  return { ...user, id: user._id, rating, posts: postsWithId };
}

async function search(query) {
  const regex = new RegExp(query, "i");
  const users = await User.find({
    $or: [{ username: regex }, { displayName: regex }],
  }).lean();
  const userIds = users.map((u) => u._id);
  const posts = await Post.find({ authorId: { $in: userIds } }).lean();
  return users.map((u) => {
    const userPosts = posts.filter((p) => p.authorId.equals(u._id));
    return { ...u, id: u._id, rating: computeAvgRating(userPosts) };
  });
}

module.exports = { findById, getProfile, search };
