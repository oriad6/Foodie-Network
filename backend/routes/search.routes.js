const { Router } = require("express");
const searchController = require("../controllers/searchController");

const router = Router();

router.get("/search", searchController.search);

module.exports = router;
