const { posts } = require("../data/mockData");
const userModel = require("./userModel");

function enrichPost(post) {
  const author = userModel.findById(post.authorId);
  return {
    ...post,
    author: {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatar: author.avatar,
    },
  };
}

function findById(id) {
  return posts.find((p) => p.id === parseInt(id));
}

function findAll(category) {
  let feed = posts;

  if (category) {
    feed = feed.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  return feed.map(enrichPost);
}

function findByIdEnriched(id) {
  const post = findById(id);
  return post ? enrichPost(post) : null;
}

function toggleLike(id, userId) {
  const post = findById(id);
  if (!post) return null;

  const likeIndex = post.likes.indexOf(userId);
  if (likeIndex >= 0) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(userId);
  }

  return enrichPost(post);
}

function setRating(id, userId, score) {
  const post = findById(id);
  if (!post) return null;

  const ratingIndex = post.ratings.findIndex((r) => r.userId === userId);
  if (ratingIndex >= 0) {
    post.ratings[ratingIndex].score = score;
  } else {
    post.ratings.push({ userId, score });
  }

  return enrichPost(post);
}

function validateRecipeFields({ title, ingredients, instructions, difficulty, category }) {
  const errors = [];
  if (!title || !title.trim()) errors.push("Title is required.");
  if (!ingredients || ingredients.length === 0) errors.push("At least one ingredient is required.");
  if (!instructions || !instructions.trim()) errors.push("Instructions are required.");
  if (!difficulty) errors.push("Difficulty is required.");
  if (!category) errors.push("Category is required.");
  return errors;
}

function create(data, authorId) {
  const newPost = {
    id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1,
    authorId,
    title: data.title.trim(),
    image: data.image || `https://placehold.co/600x400?text=${encodeURIComponent(data.title.trim())}`,
    instructions: data.instructions.trim(),
    ingredients: data.ingredients,
    difficulty: data.difficulty,
    category: data.category,
    likes: [],
    ratings: [],
    createdAt: new Date().toISOString(),
  };

  posts.push(newPost);
  return enrichPost(newPost);
}

function update(id, data, userId) {
  const postIndex = posts.findIndex((p) => p.id === parseInt(id));
  if (postIndex === -1) return { error: "not_found" };

  const post = posts[postIndex];
  if (post.authorId !== userId) return { error: "forbidden" };

  posts[postIndex] = {
    ...post,
    title: data.title.trim(),
    ingredients: data.ingredients,
    instructions: data.instructions.trim(),
    image: data.image || post.image,
    difficulty: data.difficulty,
    category: data.category,
  };

  return { post: enrichPost(posts[postIndex]) };
}

function deletePost(id, userId) {
  const postIndex = posts.findIndex((p) => p.id === parseInt(id));
  if (postIndex === -1) return { error: "not_found" };

  if (posts[postIndex].authorId !== userId) return { error: "forbidden" };

  posts.splice(postIndex, 1);
  return { success: true };
}

function search(query) {
  const q = query.toLowerCase();
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

module.exports = {
  enrichPost,
  findAll,
  findByIdEnriched,
  toggleLike,
  setRating,
  validateRecipeFields,
  create,
  update,
  deletePost,
  search,
};
