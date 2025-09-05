# CLASS API Documentation

This is the backend API powering **CLASS (Content Listening Assessment Scoring and Statistics)**.  
CLASS allows recording lectures, transcribing them, generating quizzes, and analyzing results.

---

## 📑 Table of Contents
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Audio and Transcription](#audio-and-transcription)
- [Questions](#questions)
- [Transcripts](#transcripts)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MySQL](https://www.mysql.com/) or [MongoDB](https://www.mongodb.com/) (depending on config)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/class-api.git
   cd class-api
Install dependencies:

bash
Copy code
npm install
or

bash
Copy code
yarn install
Create a .env file in the root directory:

env
Copy code
PORT=5000
MONGO_URI:your_mongodb_url
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_jwt_secret
JWT_EXPIRY=your_jwt_expiry duration
JWT_SHORT_EXPIRY=your_short_jwt_expiry_duration
OPENAI_API_KEY=your_openai_key
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BASE_URL=your_base_url
SUPABASE_URL=your_superbase_url
SUPABASE_SECRET=your_superbase_secret
LEMONFOX_API_KEY=your_lemonfox_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start the development server:
npm run dev

API should now be running on:
http://localhost:5000

🔐 Authentication
Method	Endpoint	Description
POST	/auth/signup	Register a new user
POST	/auth/login	Authenticate user and return token
POST	/auth/refresh-token	Refresh expired access token
POST	/auth/google-login	Login or signup with Google account
POST	/auth/forgot-password	Request password reset OTP/link
POST	/auth/upload-profile-image	Upload or update profile picture
POST	/auth/reset-password	Reset password using OTP/token
POST	/auth/resend-otp	Resend OTP for verification
POST	/auth/edit-profile	Update user profile details
POST	/auth/change-password	Change current password
POST	/auth/verify-otp	Verify OTP for email/phone

Example: Signup
Request

json
Copy code
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
}
Response

json
Copy code
{
  "success": true,
  "message": "Signup successful. Please verify your email.",
  "userId": "64f8a1c9b7d92"
}
🎙️ Audio and Transcription
Method	Endpoint	Description
POST	/upload	Upload lecture/voice audio
POST	/transcribe	Convert uploaded audio to text

Example: Upload Audio
Request (multipart/form-data)

makefile
Copy code
file: lecture.mp3
Response

json
Copy code
{
  "success": true,
  "fileUrl": "https://cdn.app.com/uploads/lecture123.mp3",
  "transcriptId": "6523ab1c45a98"
}
❓ Questions
Method	Endpoint	Description
POST	/questions/generate	Generate quiz questions from transcript
GET	/questions/fetch	Fetch all user-created questions/quizzes
GET	/questions/analytics	Get overall performance analytics
GET	/questions/analytics/:id	Get analytics for a specific quiz
GET	/questions/:id/results	Get results of a specific quiz
GET	/questions/fetch/responses	Fetch all user responses
GET	/questions/shared/:id	Get a shared quiz by ID
GET	/questions/response/:id	Get a specific quiz response

Example: Generate Quiz
Request

json
Copy code
{
  "transcriptId": "6523ab1c45a98",
  "numberOfQuestions": 5
}
Response

json
Copy code
{
  "success": true,
  "quizId": "673a22c9fd0b1",
  "questions": [
    {
      "id": "q1",
      "question": "What is an algorithm?",
      "options": ["A recipe", "A set of instructions", "A program", "A code editor"],
      "answer": "A set of instructions"
    },
    {
      "id": "q2",
      "question": "Why are algorithms important?",
      "options": ["They reduce cost", "They solve problems", "They replace hardware", "They create apps"],
      "answer": "They solve problems"
    }
  ]
}
📜 Transcripts
Method	Endpoint	Description
GET	/transcipts	Fetch all transcripts for a user
GET	/transcipts/:id	Fetch details of a specific transcript
PATCH	/transcipts/:id	Update transcript (e.g., edit text/title)
DELETE	/transcipts/:id	Delete a transcript

Example: Fetch Transcript
Response

json
Copy code
{
  "id": "6523ab1c45a98",
  "title": "Lecture on Algorithms",
  "text": "Today we will discuss algorithms and their role in computer science...",
  "createdAt": "2025-09-01T10:15:00Z",
  "updatedAt": "2025-09-01T10:20:00Z"
}
📌 Notes

All authenticated requests require a valid JWT access token in the header:

makefile
Copy code
Authorization: Bearer <token>
Errors follow this format:

json
Copy code
{
  "success": false,
  "message": "Error description"
}
🛠️ Tech Stack
Backend: Node.js, Express.js

Databases: MySQL + MongoDB

Auth: JWT, Google OAuth

Storage: Cloudinary/AWS (for audio + images)

Frontend: Flutter + BLoC (https://github.com/specter-hafiz/CLASS/)
