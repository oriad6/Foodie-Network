const { Router } = require("express");
const healthRoutes = require("./health.routes");
const categoriesRoutes = require("./categories.routes");
const postsRoutes = require("./posts.routes");
const recipesRoutes = require("./recipes.routes");
const usersRoutes = require("./users.routes");
const searchRoutes = require("./search.routes");
const recipeBookRoutes = require("./recipeBook.routes");
const commentsRoutes = require("./comments.routes");
const uploadRoutes = require("./upload.routes");
const authRoutes = require("./auth.routes");

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(categoriesRoutes);
router.use(postsRoutes);
router.use(recipesRoutes);
router.use(usersRoutes);
router.use(searchRoutes);
router.use(recipeBookRoutes);
router.use(commentsRoutes);
router.use(uploadRoutes);

module.exports = router;
