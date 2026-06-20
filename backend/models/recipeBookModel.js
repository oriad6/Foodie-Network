const { savedRecipes, collections } = require("../data/mockData");
const postModel = require("./postModel");

function getSavedRecipes(userId) {
  return savedRecipes
    .filter((sr) => sr.userId === userId)
    .map((sr) => {
      const post = postModel.findByIdEnriched(sr.postId);
      return post ? { ...sr, post } : null;
    })
    .filter(Boolean);
}

function getSavedByCollection(userId, collectionId) {
  return savedRecipes
    .filter(
      (sr) =>
        sr.userId === userId &&
        (collectionId === null ? sr.collectionId === null : sr.collectionId === collectionId)
    )
    .map((sr) => {
      const post = postModel.findByIdEnriched(sr.postId);
      return post ? { ...sr, post } : null;
    })
    .filter(Boolean);
}

function isRecipeSaved(userId, postId) {
  return savedRecipes.some((sr) => sr.userId === userId && sr.postId === postId);
}

function saveRecipe(userId, postId, collectionId = null) {
  const existing = savedRecipes.find((sr) => sr.userId === userId && sr.postId === postId);
  if (existing) return { error: "already_saved" };

  const post = postModel.findByIdEnriched(postId);
  if (!post) return { error: "not_found" };

  if (collectionId !== null) {
    const col = collections.find((c) => c.id === collectionId && c.userId === userId);
    if (!col) return { error: "collection_not_found" };
  }

  const entry = { userId, postId, collectionId, savedAt: new Date().toISOString() };
  savedRecipes.push(entry);
  return { entry: { ...entry, post } };
}

function unsaveRecipe(userId, postId) {
  const index = savedRecipes.findIndex((sr) => sr.userId === userId && sr.postId === postId);
  if (index === -1) return { error: "not_found" };
  savedRecipes.splice(index, 1);
  return { success: true };
}

function moveToCollection(userId, postId, collectionId) {
  const entry = savedRecipes.find((sr) => sr.userId === userId && sr.postId === postId);
  if (!entry) return { error: "not_saved" };

  if (collectionId !== null) {
    const col = collections.find((c) => c.id === collectionId && c.userId === userId);
    if (!col) return { error: "collection_not_found" };
  }

  entry.collectionId = collectionId;
  return { entry };
}

function getCollections(userId) {
  return collections.filter((c) => c.userId === userId);
}

function getCollectionById(userId, collectionId) {
  return collections.find((c) => c.id === collectionId && c.userId === userId) || null;
}

function createCollection(userId, name, description = "") {
  if (!name || !name.trim()) return { error: "name_required" };

  const newCol = {
    id: collections.length > 0 ? Math.max(...collections.map((c) => c.id)) + 1 : 1,
    userId,
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString(),
  };
  collections.push(newCol);
  return { collection: newCol };
}

function updateCollection(userId, collectionId, data) {
  const col = collections.find((c) => c.id === collectionId && c.userId === userId);
  if (!col) return { error: "not_found" };

  if (data.name !== undefined) col.name = data.name.trim();
  if (data.description !== undefined) col.description = data.description.trim();
  return { collection: col };
}

function deleteCollection(userId, collectionId) {
  const index = collections.findIndex((c) => c.id === collectionId && c.userId === userId);
  if (index === -1) return { error: "not_found" };

  // Move recipes from this collection back to unsorted
  savedRecipes
    .filter((sr) => sr.userId === userId && sr.collectionId === collectionId)
    .forEach((sr) => {
      sr.collectionId = null;
    });

  collections.splice(index, 1);
  return { success: true };
}

module.exports = {
  getSavedRecipes,
  getSavedByCollection,
  isRecipeSaved,
  saveRecipe,
  unsaveRecipe,
  moveToCollection,
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
};
