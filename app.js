const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // <-- Add this
const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const routeNotFound = require("./middlewares/routeNotFoundMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("Welcome to the CLASS-APP API");
});

// Add error handlers
app.use(routeNotFound);
app.use(errorHandler);

// Create the server with custom timeout
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ⏱ Increase timeout (e.g., 5 minutes = 300000 ms)
server.timeout = 300000; // <-- Add this line

(async () => {
  try {
    await connectDB();
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT} with custom timeout`)
    );
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
})();
