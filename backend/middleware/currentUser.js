const User = require("../schemas/User");
const { CURRENT_USERNAME } = require("../config/constants");

let cachedUserId = null;

async function currentUser(req, res, next) {
  if (!cachedUserId) {
    const user = await User.findOne({ username: CURRENT_USERNAME });
    if (!user) return res.status(500).json({ error: "Current user not found in database." });
    cachedUserId = user._id;
  }
  req.userId = cachedUserId;
  next();
}

module.exports = currentUser;
