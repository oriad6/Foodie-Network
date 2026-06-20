const categoryModel = require("../models/categoryModel");

function getCategories(req, res) {
  res.json(categoryModel.getAll());
}

module.exports = { getCategories };
