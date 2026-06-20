const { Router } = require("express");
const usersController = require("../controllers/usersController");

const router = Router();

router.get("/users/:id", usersController.getUserById);

module.exports = router;
