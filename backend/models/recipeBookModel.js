const SavedRecipe = require("../schemas/SavedRecipe");
const Collection = require("../schemas/Collection");
const postModel = require("./postModel");

function normalizeSaved(sr, post) {
  return {
    id: sr._id.toString(),
    postId: sr.postId.toString(),
    collectionId: sr.collectionId ? sr.collectionId.toString() : null,
    post,
  };
}

async function getSavedRecipes(userId) {
  const saved = await SavedRecipe.find({ userId }).lean();
  const results = [];
  for (const sr of saved) {
    const post = await postModel.findByIdEnriched(sr.postId);
    if (post) results.push(normalizeSaved(sr, post));
  }
  return results;
}

async function getSavedByCollection(userId, collectionId) {
  const filter = { userId, collectionId: collectionId };
  const saved = await SavedRecipe.find(filter).lean();
  const results = [];
  for (const sr of saved) {
    const post = await postModel.findByIdEnriched(sr.postId);
    if (post) results.push(normalizeSaved(sr, post));
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
  return { entry: normalizeSaved(entry.toObject(), post) };
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
  const obj = entry.toObject();
  return { entry: { id: obj._id.toString(), postId: obj.postId.toString(), collectionId: obj.collectionId ? obj.collectionId.toString() : null } };
}

function normalizeCollection(c) {
  return {
    id: c._id.toString(),
    name: c.name,
    description: c.description || "",
  };
}

async function getCollections(userId) {
  const cols = await Collection.find({ userId }).lean();
  return cols.map(normalizeCollection);
}

async function createCollection(userId, name, description = "") {
  if (!name || !name.trim()) return { error: "name_required" };

  const col = await Collection.create({
    userId,
    name: name.trim(),
    description: description.trim(),
  });
  return { collection: normalizeCollection(col.toObject()) };
}

async function updateCollection(userId, collectionId, data) {
  const col = await Collection.findOne({ _id: collectionId, userId });
  if (!col) return { error: "not_found" };

  if (data.name !== undefined) col.name = data.name.trim();
  if (data.description !== undefined) col.description = data.description.trim();
  await col.save();
  return { collection: normalizeCollection(col.toObject()) };
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
