// controllers/audioController.js
const { success } = require("zod/v4");
const TrancriptModel = require("../models/transcriptModel");
const {
  uploadToSupabase,
  transcribeAudioFromUrl,
} = require("../services/audioService");
const { saveTranscript } = require("../services/transcriptService");

const handleAudioUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    console.log("Received file:", file.originalname);
    console.log("File size:", file.size, "bytes");
    console.log("File type:", file.mimetype);
    console.log("File buffer length:", file.buffer.length);

    const publicUrl = await uploadToSupabase(file);

    res.status(200).json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Audio upload failed",
      error: error.message,
    });
  }
};

const handleAudioTranscription = async (req, res) => {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl) {
      return res.status(400).json({ error: "audioUrl is required" });
    }
    console.log(audioUrl);
    const transcription = await transcribeAudioFromUrl(audioUrl);
    console.log("Transcription result:", transcription);
    await saveTranscript({
      audioUrl,
      transcript: transcription,
      userId: req.user._id, // Assuming user is authenticated and req.user is set
    });
    console.log("Transcript saved successfully");
    res.status(200).json({ success: true, transcript: transcription });
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({
      success: false,
      message: "Transcription failed",
      error: e.message,
    });
  }
};

module.exports = {
  handleAudioUpload,
  handleAudioTranscription,
};
