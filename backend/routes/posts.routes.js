const { Router } = require("express");
const postsController = require("../controllers/postsController");

const router = Router();

router.get("/posts", postsController.getPosts);
router.get("/posts/:id", postsController.getPostById);
router.put("/posts/:id/like", postsController.toggleLike);
router.put("/posts/:id/rating", postsController.setRating);

module.exports = router;
