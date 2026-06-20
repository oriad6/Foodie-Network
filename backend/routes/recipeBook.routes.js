const { Router } = require("express");
const controller = require("../controllers/recipeBookController");

const router = Router();

// Saved recipes
router.get("/recipe-book/saved", controller.getSavedRecipes);
router.get("/recipe-book/saved/:postId/check", controller.checkSaved);
router.post("/recipe-book/saved/:postId", controller.saveRecipe);
router.delete("/recipe-book/saved/:postId", controller.unsaveRecipe);
router.put("/recipe-book/saved/:postId/collection", controller.moveToCollection);

// Collections
router.get("/recipe-book/collections", controller.getCollections);
router.post("/recipe-book/collections", controller.createCollection);
router.put("/recipe-book/collections/:id", controller.updateCollection);
router.delete("/recipe-book/collections/:id", controller.deleteCollection);

module.exports = router;
