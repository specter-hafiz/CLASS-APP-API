const express = require("express");
const router = express.Router();
const audioController = require("../controllers/audioController");
const upload = require("../middlewares/upload");
const authenticate = require("../middlewares/authMiddleware");

router.post(
  "/transcribe",
  upload.single("audio"),
  authenticate,
  audioController.handleAudioUploadAndTranscription
);

// router.post(
//   "/estimate-time",
//   upload.single("audio"),
//   audioController.estimateTranscriptionTime
// );

module.exports = router;
