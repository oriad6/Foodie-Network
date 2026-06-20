const { users, posts } = require("../data/mockData");

function findById(id) {
  return users.find((u) => u.id === parseInt(id));
}

function getProfile(id) {
  const user = findById(id);
  if (!user) return null;

  const userPosts = posts.filter((p) => p.authorId === user.id);
  return { ...user, posts: userPosts };
}

function search(query) {
  const q = query.toLowerCase();
  return users.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
  );
}

module.exports = { findById, getProfile, search };
