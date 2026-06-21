const postModel = require("../models/postModel");

async function createRecipe(req, res) {
  const { title, ingredients, instructions, image, difficulty, category } = req.body;
  const errors = postModel.validateRecipeFields({ title, ingredients, instructions, difficulty, category });

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  const post = await postModel.create(
    { title, ingredients, instructions, image, difficulty, category },
    req.userId
  );
  res.status(201).json(post);
}

async function updateRecipe(req, res) {
  const { title, ingredients, instructions, image, difficulty, category } = req.body;
  const errors = postModel.validateRecipeFields({ title, ingredients, instructions, difficulty, category });

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  const result = await postModel.update(
    req.params.id,
    { title, ingredients, instructions, image, difficulty, category },
    req.userId
  );

  if (result.error === "not_found") return res.status(404).json({ error: "Post not found" });
  if (result.error === "forbidden") return res.status(403).json({ error: "You can only edit your own posts." });

  res.json(result.post);
}

async function deleteRecipe(req, res) {
  const result = await postModel.deletePost(req.params.id, req.userId);

  if (result.error === "not_found") return res.status(404).json({ error: "Post not found" });
  if (result.error === "forbidden") return res.status(403).json({ error: "You can only delete your own posts." });

  res.json({ success: true });
}

module.exports = { createRecipe, updateRecipe, deleteRecipe };
