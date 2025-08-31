const transcriptService = require("../services/transcriptService");

const getTranscripts = async (req, res) => {
  const userId = req.user._id;
  const transcripts = await transcriptService.getTranscriptsByUserId(userId);
  return res.status(200).json({ success: true, transcripts });
};

const getTranscriptById = async (req, res) => {
  const { id } = req.params;
  const transcript = await transcriptService.getTranscriptById(id);
  if (!transcript) {
    return res
      .status(404)
      .json({ success: false, message: "Transcript not found" });
  }
  return res.status(200).json({ success: true, transcript });
};

const updateTranscriptById = async (req, res) => {
  const { id } = req.params;
  const { transcript } = req.body;

  const updatedTranscript = await transcriptService.updateTranscriptById(id, {
    transcript,
  });

  return res.status(200).json({ success: true, updatedTranscript });
};

const deleteTranscriptById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTranscript = await transcriptService.deleteTranscriptById(id);
    if (!deletedTranscript) {
      return res
        .status(404)
        .json({ success: false, message: "Transcript not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Transcript deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getTranscripts,
  getTranscriptById,
  updateTranscriptById,
  deleteTranscriptById,
};
