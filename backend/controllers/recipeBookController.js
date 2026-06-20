const { CURRENT_USER_ID } = require("../config/constants");
const recipeBookModel = require("../models/recipeBookModel");

function getSavedRecipes(req, res) {
  const { collectionId } = req.query;
  let recipes;

  if (collectionId !== undefined) {
    const colId = collectionId === "null" ? null : parseInt(collectionId);
    recipes = recipeBookModel.getSavedByCollection(CURRENT_USER_ID, colId);
  } else {
    recipes = recipeBookModel.getSavedRecipes(CURRENT_USER_ID);
  }

  res.json(recipes);
}

function checkSaved(req, res) {
  const postId = parseInt(req.params.postId);
  res.json({ saved: recipeBookModel.isRecipeSaved(CURRENT_USER_ID, postId) });
}

function saveRecipe(req, res) {
  const postId = parseInt(req.params.postId);
  const { collectionId = null } = req.body;
  const result = recipeBookModel.saveRecipe(CURRENT_USER_ID, postId, collectionId);

  if (result.error === "already_saved") return res.status(409).json({ error: "Recipe already saved." });
  if (result.error === "not_found") return res.status(404).json({ error: "Recipe not found." });
  if (result.error === "collection_not_found") return res.status(404).json({ error: "Collection not found." });

  res.status(201).json(result.entry);
}

function unsaveRecipe(req, res) {
  const postId = parseInt(req.params.postId);
  const result = recipeBookModel.unsaveRecipe(CURRENT_USER_ID, postId);

  if (result.error === "not_found") return res.status(404).json({ error: "Recipe not saved." });
  res.json({ success: true });
}

function moveToCollection(req, res) {
  const postId = parseInt(req.params.postId);
  const { collectionId } = req.body;

  const result = recipeBookModel.moveToCollection(
    CURRENT_USER_ID,
    postId,
    collectionId === null || collectionId === undefined ? null : collectionId
  );

  if (result.error === "not_saved") return res.status(404).json({ error: "Recipe not saved." });
  if (result.error === "collection_not_found") return res.status(404).json({ error: "Collection not found." });

  res.json(result.entry);
}

function getCollections(req, res) {
  res.json(recipeBookModel.getCollections(CURRENT_USER_ID));
}

function createCollection(req, res) {
  const { name, description } = req.body;
  const result = recipeBookModel.createCollection(CURRENT_USER_ID, name, description);

  if (result.error === "name_required") return res.status(400).json({ error: "Collection name is required." });

  res.status(201).json(result.collection);
}

function updateCollection(req, res) {
  const collectionId = parseInt(req.params.id);
  const result = recipeBookModel.updateCollection(CURRENT_USER_ID, collectionId, req.body);

  if (result.error === "not_found") return res.status(404).json({ error: "Collection not found." });
  res.json(result.collection);
}

function deleteCollection(req, res) {
  const collectionId = parseInt(req.params.id);
  const result = recipeBookModel.deleteCollection(CURRENT_USER_ID, collectionId);

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
