const postModel = require("../models/postModel");
const { CURRENT_USER_ID } = require("../config/constants");

function createRecipe(req, res) {
  const { title, ingredients, instructions, image, difficulty, category } = req.body;
  const errors = postModel.validateRecipeFields({
    title,
    ingredients,
    instructions,
    difficulty,
    category,
  });

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  const post = postModel.create(
    { title, ingredients, instructions, image, difficulty, category },
    CURRENT_USER_ID
  );
  res.status(201).json(post);
}

function updateRecipe(req, res) {
  const { title, ingredients, instructions, image, difficulty, category } = req.body;
  const errors = postModel.validateRecipeFields({
    title,
    ingredients,
    instructions,
    difficulty,
    category,
  });

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  const result = postModel.update(
    req.params.id,
    { title, ingredients, instructions, image, difficulty, category },
    CURRENT_USER_ID
  );

  if (result.error === "not_found") {
    return res.status(404).json({ error: "Post not found" });
  }
  if (result.error === "forbidden") {
    return res.status(403).json({ error: "You can only edit your own posts." });
  }

  res.json(result.post);
}

function deleteRecipe(req, res) {
  const result = postModel.deletePost(req.params.id, CURRENT_USER_ID);

  if (result.error === "not_found") {
    return res.status(404).json({ error: "Post not found" });
  }
  if (result.error === "forbidden") {
    return res.status(403).json({ error: "You can only delete your own posts." });
  }

  res.json({ success: true });
}

module.exports = { createRecipe, updateRecipe, deleteRecipe };
