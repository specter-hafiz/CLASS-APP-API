// controllers/audioController.js
const {
  uploadToSupabase,
  transcribeAudioFromUrl,
} = require("../services/audioService");

const handleAudioUploadAndTranscription = async (req, res) => {
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
    const transcription = await transcribeAudioFromUrl(publicUrl);

    res.status(200).json({
      success: true,
      url: publicUrl,
      transcription,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Audio transcription failed",
      error: error.message,
    });
  }
};

module.exports = {
  handleAudioUploadAndTranscription,
};
