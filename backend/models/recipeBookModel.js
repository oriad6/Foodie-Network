const SavedRecipe = require("../schemas/SavedRecipe");
const Collection = require("../schemas/Collection");
const postModel = require("./postModel");

async function getSavedRecipes(userId) {
  const saved = await SavedRecipe.find({ userId }).lean();
  const results = [];
  for (const sr of saved) {
    const post = await postModel.findByIdEnriched(sr.postId);
    if (post) results.push({ ...sr, id: sr._id, post });
  }
  return results;
}

async function getSavedByCollection(userId, collectionId) {
  const filter = { userId, collectionId: collectionId };
  const saved = await SavedRecipe.find(filter).lean();
  const results = [];
  for (const sr of saved) {
    const post = await postModel.findByIdEnriched(sr.postId);
    if (post) results.push({ ...sr, id: sr._id, post });
  }
  return results;
}

async function isRecipeSaved(userId, postId) {
  const count = await SavedRecipe.countDocuments({ userId, postId });
  return count > 0;
}

async function saveRecipe(userId, postId, collectionId = null) {
  const existing = await SavedRecipe.findOne({ userId, postId });
  if (existing) return { error: "already_saved" };

  const post = await postModel.findByIdEnriched(postId);
  if (!post) return { error: "not_found" };

  if (collectionId !== null) {
    const col = await Collection.findOne({ _id: collectionId, userId });
    if (!col) return { error: "collection_not_found" };
  }

  const entry = await SavedRecipe.create({ userId, postId, collectionId });
  return { entry: { ...entry.toObject(), id: entry._id, post } };
}

async function unsaveRecipe(userId, postId) {
  const result = await SavedRecipe.findOneAndDelete({ userId, postId });
  if (!result) return { error: "not_found" };
  return { success: true };
}

async function moveToCollection(userId, postId, collectionId) {
  const entry = await SavedRecipe.findOne({ userId, postId });
  if (!entry) return { error: "not_saved" };

  if (collectionId !== null) {
    const col = await Collection.findOne({ _id: collectionId, userId });
    if (!col) return { error: "collection_not_found" };
  }

  entry.collectionId = collectionId;
  await entry.save();
  return { entry: entry.toObject() };
}

async function getCollections(userId) {
  return Collection.find({ userId }).lean();
}

async function createCollection(userId, name, description = "") {
  if (!name || !name.trim()) return { error: "name_required" };

  const col = await Collection.create({
    userId,
    name: name.trim(),
    description: description.trim(),
  });
  return { collection: col.toObject() };
}

async function updateCollection(userId, collectionId, data) {
  const col = await Collection.findOne({ _id: collectionId, userId });
  if (!col) return { error: "not_found" };

  if (data.name !== undefined) col.name = data.name.trim();
  if (data.description !== undefined) col.description = data.description.trim();
  await col.save();
  return { collection: col.toObject() };
}

async function deleteCollection(userId, collectionId) {
  const col = await Collection.findOneAndDelete({ _id: collectionId, userId });
  if (!col) return { error: "not_found" };

  await SavedRecipe.updateMany(
    { userId, collectionId },
    { $set: { collectionId: null } }
  );
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
  createCollection,
  updateCollection,
  deleteCollection,
};
