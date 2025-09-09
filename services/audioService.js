// services/audioService.js
const supabase = require("../utils/superbaseClient");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const FormData = require("form-data");

const uploadToSupabase = async (file) => {
  const { originalname, mimetype, buffer } = file;
  const fileExt = path.extname(originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = `audios/${fileName}`;

  const { error } = await supabase.storage
    .from("audio-recordings")
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) throw new Error("Failed to upload to Supabase: " + error.message);

  const { data } = supabase.storage
    .from("audio-recordings")
    .getPublicUrl(filePath);
  return data.publicUrl;
};

const transcribeAudioFromUrl = async (fileUrl) => {
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch audio file: ${fileResponse.statusText}`);
  }
  const formData = new FormData();
  formData.append("file", fileUrl);
  formData.append("language", "english");
  formData.append("response_format", "json");

  const response = await fetch(
    "https://api.lemonfox.ai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lemonfox error: ${errorText}`);
  }

  const data = await response.json();
  return data.text;
};

module.exports = {
  uploadToSupabase,
  transcribeAudioFromUrl,
};
