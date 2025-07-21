const fs = require("fs");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");

const runWhisper = (filePath) => {
  const scriptPath = path.join(__dirname, "../python/whisper_transcribe.py");

  return new Promise((resolve, reject) => {
    exec(
      `python3 "${scriptPath}" "${filePath}"`,
      { encoding: "utf8" },
      (error, stdout, stderr) => {
        if (error) return reject(stderr || error.message);
        resolve(stdout.trim());
      }
    );
  });
};

exports.handleAudioTranscription = async (file) => {
  const originalname = file.originalname || "audio.wav";
  const tempPath = path.join(os.tmpdir(), Date.now() + "-" + originalname);

  try {
    fs.writeFileSync(tempPath, file.buffer);
    const transcript = await runWhisper(tempPath);
    return transcript;
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
};

exports.estimateTime = (filePath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../python/whisper_estimate.py");
    exec(`python3 "${scriptPath}" "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (err) {
        reject(new Error("Invalid output format from estimation script"));
      }
    });
  });
};
