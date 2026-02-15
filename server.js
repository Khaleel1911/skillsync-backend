const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ success: true, message: "SkillSync API running", data: {} });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/exchange", require("./routes/exchangeRoutes"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: {},
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect DB", error);
    process.exit(1);
  });

