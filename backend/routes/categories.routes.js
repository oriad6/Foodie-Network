const { Router } = require("express");
const categoriesController = require("../controllers/categoriesController");

const router = Router();

router.get("/categories", categoriesController.getCategories);

module.exports = router;
