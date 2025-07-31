const express = require("express");
const router = express.Router();
const audioController = require("../controllers/audioController");
const upload = require("../middlewares/upload");
const authenticate = require("../middlewares/authMiddleware");

router.post(
  "/upload",
  upload.single("audio"),
  authenticate,
  audioController.handleAudioUpload
);

router.post(
  "/transcribe",
  authenticate,
  audioController.handleAudioTranscription
);

module.exports = router;
