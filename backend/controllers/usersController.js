const userModel = require("../models/userModel");

async function getUserById(req, res) {
  const user = await userModel.getProfile(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

module.exports = { getUserById };
