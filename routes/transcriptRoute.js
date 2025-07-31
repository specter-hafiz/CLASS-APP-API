const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");
const authenticate = require("../middlewares/authMiddleware");

router.get("/", authenticate, transcriptController.getTranscripts);

router.get("/:id", authenticate, transcriptController.getTranscriptById);

router.patch("/:id", authenticate, transcriptController.updateTranscriptById);
router.delete("/:id", authenticate, transcriptController.deleteTranscriptById);

module.exports = router;
