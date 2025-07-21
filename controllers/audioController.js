const transcribeService = require("../services/audioService");

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }
    console.log("Mimetype:", req.file.mimetype);
    console.log("Buffer size:", req.file.buffer.length, "bytes");
    console.log("File path:", req.filePath);
    const transcript = await transcribeService.handleAudioTranscription(
      req.file
    );

    res.status(200).json({
      success: true,
      transcript,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Transcription failed",
      error: error.toString(),
    });
  }
};

exports.estimateTranscriptionTime = async (req, res) => {
  try {
    const filePath = req.body.filePath;
    if (!filePath) {
      return res
        .status(400)
        .json({ success: false, message: "File path is required" });
    }

    const result = await transcribeService.estimateTime(filePath);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
