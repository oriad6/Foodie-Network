const userModel = require("../models/userModel");

function getUserById(req, res) {
  const user = userModel.getProfile(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

module.exports = { getUserById };
