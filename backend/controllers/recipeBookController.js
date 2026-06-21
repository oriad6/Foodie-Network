const recipeBookModel = require("../models/recipeBookModel");

async function getSavedRecipes(req, res) {
  const { collectionId } = req.query;
  let recipes;

  if (collectionId !== undefined) {
    const colId = collectionId === "null" ? null : collectionId;
    recipes = await recipeBookModel.getSavedByCollection(req.userId, colId);
  } else {
    recipes = await recipeBookModel.getSavedRecipes(req.userId);
  }

  res.json(recipes);
}

async function checkSaved(req, res) {
  const saved = await recipeBookModel.isRecipeSaved(req.userId, req.params.postId);
  res.json({ saved });
}

async function saveRecipe(req, res) {
  const { collectionId = null } = req.body;
  const result = await recipeBookModel.saveRecipe(req.userId, req.params.postId, collectionId);

  if (result.error === "already_saved") return res.status(409).json({ error: "Recipe already saved." });
  if (result.error === "not_found") return res.status(404).json({ error: "Recipe not found." });
  if (result.error === "collection_not_found") return res.status(404).json({ error: "Collection not found." });

  res.status(201).json(result.entry);
}

async function unsaveRecipe(req, res) {
  const result = await recipeBookModel.unsaveRecipe(req.userId, req.params.postId);

  if (result.error === "not_found") return res.status(404).json({ error: "Recipe not saved." });
  res.json({ success: true });
}

async function moveToCollection(req, res) {
  const { collectionId } = req.body;
  const result = await recipeBookModel.moveToCollection(
    req.userId,
    req.params.postId,
    collectionId === null || collectionId === undefined ? null : collectionId
  );

  if (result.error === "not_saved") return res.status(404).json({ error: "Recipe not saved." });
  if (result.error === "collection_not_found") return res.status(404).json({ error: "Collection not found." });

  res.json(result.entry);
}

async function getCollections(req, res) {
  res.json(await recipeBookModel.getCollections(req.userId));
}

async function createCollection(req, res) {
  const { name, description } = req.body;
  const result = await recipeBookModel.createCollection(req.userId, name, description);

  if (result.error === "name_required") return res.status(400).json({ error: "Collection name is required." });

  res.status(201).json(result.collection);
}

async function updateCollection(req, res) {
  const result = await recipeBookModel.updateCollection(req.userId, req.params.id, req.body);

  if (result.error === "not_found") return res.status(404).json({ error: "Collection not found." });
  res.json(result.collection);
}

async function deleteCollection(req, res) {
  const result = await recipeBookModel.deleteCollection(req.userId, req.params.id);

  if (result.error === "not_found") return res.status(404).json({ error: "Collection not found." });
  res.json({ success: true });
}

module.exports = {
  getSavedRecipes,
  checkSaved,
  saveRecipe,
  unsaveRecipe,
  moveToCollection,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
};
