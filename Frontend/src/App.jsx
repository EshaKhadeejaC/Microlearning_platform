// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import "./App.css";

// Extract the upload component into a separate component
function UploadPage() {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState("");
  const [videoType, setVideoType] = useState("local");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [tutorId, setTutorId] = useState("tutor123");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const getYoutubeVideoId = (url) => {
    // Corrected regex for YouTube video IDs
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (videoType === "local" && !videoFile) {
      return setMessage("Please select a video file to upload.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", about);
    formData.append("category", category);
    formData.append("video_type", videoType);
    formData.append("tutor_id", tutorId);

    if (videoType === "local") {
      formData.append("video_file", videoFile);
    } else {
      formData.append("youtube_url", youtubeUrl);
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/lessons/upload_video",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("✅ Video uploaded successfully!");
      const lesson = res.data.lesson;

      if (lesson.video_type === "local") {
        console.log("📺 Preview URL →", previewUrl);
        setPreviewUrl(`http://localhost:8000${lesson.content_url}`);
      } else {
        const videoId = getYoutubeVideoId(lesson.content_url);
        if (videoId) {
          // Standard YouTube embed URL
          setPreviewUrl(`https://www.youtube.com/embed/${videoId}`);
        } else {
          setMessage("❌ Upload failed: Invalid YouTube URL provided by the server.");
          setPreviewUrl(null);
        }
      }
    } catch (err) {
      setMessage("❌ Upload failed: " + (err?.response?.data?.detail || err.message));
      setPreviewUrl(null);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2>📤 Upload New Lesson</h2>
        <form onSubmit={handleSubmit}>
          <label>Lesson Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />

          <label>About</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Brief description of the lesson"
            required
          ></textarea>

          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Programming, Math, Science"
            required
          />

          <label>Video Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="local"
                checked={videoType === "local"}
                onChange={() => setVideoType("local")}
              />
              Local Upload
            </label>
            <label>
              <input
                type="radio"
                value="youtube"
                checked={videoType === "youtube"}
                onChange={() => setVideoType("youtube")}
              />
              YouTube Link
            </label>
          </div>

          {videoType === "local" && (
            <>
              <label>Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                required
              />
            </>
          )}

          {videoType === "youtube" && (
            <>
              <label>YouTube URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=your_video_id"
                required
              />
            </>
          )}

          <button type="submit">Upload</button>
        </form>

        {message && <p className="message">{message}</p>}

        {previewUrl && (
          <div className="video-preview">
            {/* Check for standard YouTube embed URL pattern */}
            {previewUrl.includes("youtube.com/embed/") ? (
              <iframe
                width="100%"
                height="315"
                src={previewUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                controls
                width="100%"
                src={previewUrl}
                onError={() =>
                  alert("⚠️ Failed to load video. Check that it was uploaded and served correctly.")
                }
                onLoadedData={() => console.log("✅ Video loaded")}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;