const TranscriptModel = require("../models/transcriptModel");
const supabase = require("../utils/superbaseClient");
const getTranscriptsByUserId = async (userId) => {
  try {
    const transcripts = await TranscriptModel.find({ userId }).sort({
      createdAt: -1,
    });
    return transcripts;
  } catch (error) {
    throw new Error("Failed to retrieve transcripts");
  }
};
const getTranscriptById = async (id) => {
  try {
    const transcript = await TranscriptModel.findById(id);
    if (!transcript) {
      throw new Error("Transcript not found");
    }
    console.log("Retrieved transcript:", transcript._id);
    return transcript;
  } catch (error) {
    throw new Error("Failed to retrieve transcript");
  }
};
const updateTranscriptById = async (id, updateData) => {
  try {
    const updatedTranscript = await TranscriptModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!updatedTranscript) {
      throw new Error("Transcript not found");
    }
    return updatedTranscript;
  } catch (error) {
    console.error("Error updating transcript:", error.message);
    throw new Error("Failed to update transcript");
  }
};

const deleteTranscriptById = async (id) => {
  try {
    const transcript = await TranscriptModel.findById(id);
    if (!transcript) {
      throw new Error("Transcript not found");
    }
    console.log("Deleting transcript:", transcript._id);
    const audioUrl = transcript.audioUrl;
    const storagePath = extractStoragePath(audioUrl);
    console.log("Extracted storage path:", storagePath);
    const audioDeleted = await deleteAudioFromSupabase(
      "audio-recordings",
      storagePath
    );
    if (!audioDeleted) {
      throw new Error("Failed to delete audio file");
    }
    console.log("Audio file deleted successfully:", audioUrl);
    // Optionally, delete the audio file from storage if needed
    const deletedTranscript = await TranscriptModel.findByIdAndDelete(id);

    if (!deletedTranscript) {
      throw new Error("Transcript not found");
    }
    console.log("Transcript deleted successfully:", deletedTranscript._id);
    return deletedTranscript;
  } catch (error) {
    throw new Error("Failed to delete transcript");
  }
};

const saveTranscript = async ({ audioUrl, transcript, userId }) => {
  try {
    const newTranscript = new TranscriptModel({
      audioUrl,
      transcript,
      userId,
    });
    console.log("Saving transcript:", newTranscript);
    await newTranscript.save();
    return transcript;
  } catch (error) {
    throw new Error("Failed to save transcript");
  }
};

async function deleteAudioFromSupabase(bucketName, filePath) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    console.error("Error deleting file:", error.message);
    return false;
  }

  console.log("File deleted successfully:", data);
  return true;
}

function extractStoragePath(publicUrl) {
  const prefix = "/storage/v1/object/public/audio-recordings/";
  const index = publicUrl.indexOf(prefix);
  if (index === -1) return null;
  return publicUrl.substring(index + prefix.length);
}

// Example usage

module.exports = {
  saveTranscript,
  getTranscriptsByUserId,
  getTranscriptById,
  updateTranscriptById,
  deleteTranscriptById,
};
