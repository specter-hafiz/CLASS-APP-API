const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const audioRoutes = require("./audioRoutes");
const questionRoutes = require("./questionRoutes");

router.use("/auth", authRoutes);
router.use("/audio", audioRoutes);
router.use("/questions", questionRoutes);

module.exports = router;
