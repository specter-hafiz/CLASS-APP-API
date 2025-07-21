import io
import json
import whisper
import sys
import os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load the Whisper model (base is a good balance between speed and accuracy)
model = whisper.load_model("base")

# Path to audio file
audio_path = sys.argv[1] if len(sys.argv) > 1 else "audio.mp3"

# Check if the file exists
if not os.path.exists(audio_path):
    print(f"Audio file not found at: {audio_path}")
    sys.exit(1)

# Transcribe the audio and print the result
result = model.transcribe(audio_path)
print(json.dumps({"text": result["text"]}, ensure_ascii=False))
