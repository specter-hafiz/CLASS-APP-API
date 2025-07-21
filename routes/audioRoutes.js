const express = require("express");
const router = express.Router();
const audioController = require("../controllers/audioController");
const upload = require("../middlewares/upload");

router.post(
  "/transcribe",
  upload.single("audio"),
  audioController.transcribeAudio
);

router.post(
  "/estimate-time",
  upload.single("audio"),
  audioController.estimateTranscriptionTime
);

module.exports = router;
