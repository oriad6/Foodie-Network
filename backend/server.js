require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const path = require("path");
const cors = require("cors");
const { PORT } = require("./config/constants");
const connectDB = require("./config/db");
const apiRoutes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const currentUser = require("./middleware/currentUser");
app.use("/api", currentUser, apiRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
