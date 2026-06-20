const { Router } = require("express");
const recipesController = require("../controllers/recipesController");

const router = Router();

router.post("/recipes", recipesController.createRecipe);
router.put("/recipes/:id", recipesController.updateRecipe);
router.delete("/recipes/:id", recipesController.deleteRecipe);

module.exports = router;
