const mongoose = require("mongoose");

const savedRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
}, { timestamps: true });

savedRecipeSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("SavedRecipe", savedRecipeSchema);
