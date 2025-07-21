import sys
import os
import json
import torchaudio
import io

# Ensure proper UTF-8 encoding in output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

audio_path = sys.argv[1] if len(sys.argv) > 1 else "audio.mp3"

# Check if the file exists
if not os.path.exists(audio_path):
    print(json.dumps({"success": False, "message": f"Audio not found at {audio_path}"}))
    sys.exit(1)

# Load and get duration
waveform, sample_rate = torchaudio.load(audio_path)
duration_sec = waveform.shape[1] / sample_rate

# Define estimated processing ratio (adjust based on CPU or GPU)
# 2.0 = 2x real-time => slow CPU; 0.5 = faster GPU
processing_ratio = 2.0
estimated_time = round(duration_sec * processing_ratio, 2)

# Output result
print(json.dumps({
    "success": True,
    "durationInSeconds": round(duration_sec, 2),
    "estimatedProcessingTimeInSeconds": estimated_time
}, ensure_ascii=False))
