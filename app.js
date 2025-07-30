const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const routeNotFound = require("./middlewares/routeNotFoundMiddleware");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("Welcome to the CLASS-APP API");
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
})();
app.use(routeNotFound);
app.use(errorHandler);
