const { Router } = require("express");
const controller = require("../controllers/commentsController");

const router = Router();

router.get("/posts/:postId/comments", controller.getComments);
router.post("/posts/:postId/comments", controller.createComment);
router.delete("/comments/:commentId", controller.deleteComment);
router.put("/comments/:commentId/like", controller.toggleLike);

module.exports = router;
