const Post = require("../schemas/Post");
const User = require("../schemas/User");

async function enrichPost(post) {
  const author = await User.findById(post.authorId).lean();
  return {
    ...post,
    id: post._id,
    createdAt: post.createdAt || post._id.getTimestamp().toISOString(),
    author: {
      id: author._id,
      username: author.username,
      displayName: author.displayName,
      avatar: author.avatar,
    },
  };
}

async function findAll(category) {
  const filter = category
    ? { category: new RegExp(`^${category}$`, "i") }
    : {};
  const posts = await Post.find(filter).lean();
  return Promise.all(posts.map(enrichPost));
}

async function findByIdEnriched(id) {
  const post = await Post.findById(id).lean();
  if (!post) return null;
  return enrichPost(post);
}

async function toggleLike(id, userId) {
  const post = await Post.findById(id);
  if (!post) return null;

  const likeIndex = post.likes.findIndex((lid) => lid.equals(userId));
  if (likeIndex >= 0) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(userId);
  }
  await post.save();
  return enrichPost(post.toObject());
}

async function setRating(id, userId, score) {
  const post = await Post.findById(id);
  if (!post) return null;

  const existing = post.ratings.find((r) => r.userId.equals(userId));
  if (existing) {
    existing.score = score;
  } else {
    post.ratings.push({ userId, score });
  }
  await post.save();
  return enrichPost(post.toObject());
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

async function create(data, authorId) {
  const post = await Post.create({
    authorId,
    title: data.title.trim(),
    image: data.image || `https://placehold.co/600x400?text=${encodeURIComponent(data.title.trim())}`,
    instructions: data.instructions.trim(),
    ingredients: data.ingredients,
    difficulty: data.difficulty,
    category: data.category,
  });
  return enrichPost(post.toObject());
}

async function update(id, data, userId) {
  const post = await Post.findById(id);
  if (!post) return { error: "not_found" };
  if (!post.authorId.equals(userId)) return { error: "forbidden" };

  post.title = data.title.trim();
  post.ingredients = data.ingredients;
  post.instructions = data.instructions.trim();
  post.image = data.image || post.image;
  post.difficulty = data.difficulty;
  post.category = data.category;
  await post.save();

  return { post: await enrichPost(post.toObject()) };
}

async function deletePost(id, userId) {
  const post = await Post.findById(id);
  if (!post) return { error: "not_found" };
  if (!post.authorId.equals(userId)) return { error: "forbidden" };

  await Post.findByIdAndDelete(id);
  return { success: true };
}

async function search(query) {
  const regex = new RegExp(query, "i");
  return Post.find({
    $or: [{ title: regex }, { category: regex }],
  }).lean();
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
