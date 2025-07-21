const { spawn } = require("child_process");

exports.transcribeAudio = (filePath) => {
  const scriptPath = path.join(__dirname, "../python/whisper_transcribe.py");

  return new Promise((resolve, reject) => {
    const process = spawn("python3", [scriptPath, filePath]);

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => (output += data));
    process.stderr.on("data", (data) => (errorOutput += data));

    process.on("close", (code) => {
      if (code !== 0) {
        return reject(errorOutput || `Process exited with code ${code}`);
      }
      resolve(output.trim());
    });
  });
};
