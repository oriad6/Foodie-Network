const express = require("express");
const path = require("path");
const cors = require("cors");
const { PORT } = require("./config/constants");
const apiRoutes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
