import React, { useState, useEffect } from "react";
import {
  Upload,
  Video,
  Plus,
  Edit,
  Trash2,
  Search,
  Folder,
  Link,
  File,
  Check,
  MoreVertical,
  Play,
  Clock,
} from "lucide-react";

const COLORS = {
  bg: "#000000",
  card: "#1A1A1A",
  border: "rgba(255,255,255,0.1)",
  text: "#FFFFFF",
  gold: "#FFD700",
  blue: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
};

export default function Videos() {
  const [selectedTopic, setSelectedTopic] = useState(1);

  const API = `${import.meta.env.VITE_API_URL}/api`;
  // const API = "http://localhost:5000/api";

  const [topics, setTopics] = useState([]);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [uploadType, setUploadType] = useState("youtube");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [videoCounts, setVideoCounts] = useState({});

  // Fetch topics
  useEffect(() => {
    fetchTopics();
  }, []);

  // Fetch videos when topic changes
  useEffect(() => {
    if (selectedTopic) {
      fetchVideos(selectedTopic);
    }
  }, [selectedTopic]);

  // Update video counts when videos change
  useEffect(() => {
    const counts = {};
    topics.forEach(topic => {
      counts[topic.id] = videos.filter(v => v.topic_id === topic.id).length;
    });
    setVideoCounts(counts);
  }, [videos, topics]);

  // Filter videos when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  const fetchTopics = async () => {
    const res = await fetch(`${API}/videos/topics`);
    const data = await res.json();
    setTopics(data);
  };

  const fetchVideos = async (topicId) => {
    try {
      const res = await fetch(`${API}/videos/${topicId}`);
      const data = await res.json();
      setVideos(data);
      setFilteredVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) {
      alert("Please enter a topic name");
      return;
    }

    try {
      const res = await fetch(`${API}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTopicName }),
      });

      if (!res.ok) throw new Error("Failed to add topic");

      const topic = await res.json();
      setTopics((prev) => [...prev, { ...topic, count: 0 }]);
      setNewTopicName("");
      setShowAddTopic(false);
      
      // Show success alert
      showSuccess("Topic added successfully!");
    } catch (error) {
      console.error("Error adding topic:", error);
      alert("Failed to add topic");
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };

  const uploadYoutube = async () => {
    const formData = new FormData();
    formData.append("topic_id", selectedTopic);
    formData.append("title", videoTitle);
    formData.append("link", videoUrl);

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    const res = await fetch(`${API}/videos/youtube`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload YouTube video");
    return res.json();
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("topic_id", selectedTopic);
    formData.append("title", videoTitle);
    formData.append("video", file);

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    const res = await fetch(`${API}/videos/file`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload file");
    return res.json();
  };

  const handleUpload = async () => {
    setThumbnail(null);
    if (!videoTitle) {
      alert("Video title is required");
      return;
    }

    try {
      if (uploadType === "youtube") {
        if (!videoUrl) {
          alert("YouTube link is required");
          return;
        }
        await uploadYoutube();
        showSuccess("YouTube video added successfully!");
      } else {
        if (!file) {
          alert("Please select an MP4 file");
          return;
        }
        await uploadFile();
        showSuccess("Video file uploaded successfully!");
      }

      // Refresh videos
      await fetchVideos(selectedTopic);
      
      // Reset form
      setShowUpload(false);
      setVideoTitle("");
      setVideoUrl("");
      setFile(null);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      const res = await fetch(`${API}/videos/${videoId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete video");
      
      // Remove from state
      setVideos(videos.filter(video => video.id !== videoId));
      setFilteredVideos(filteredVideos.filter(video => video.id !== videoId));
      setShowDeleteConfirm(null);
      
      showSuccess("Video deleted successfully!");
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  const handlePlayVideo = (video) => {
    if (video.type === "youtube") {
      window.open(video.link, "_blank");
    } else {
      window.open(`${API}/videos/stream/${video.id}`, "_blank");
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:px-6 md:py-4"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
            style={{
              backgroundColor: COLORS.green,
              color: "#FFFFFF",
            }}
          >
            <Check size={20} />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: COLORS.gold }}
              >
                Video Library
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: COLORS.text, opacity: 0.7 }}
              >
                Manage your educational videos and topics
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddTopic(true)}
                className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Folder size={18} /> New Topic
              </button>

              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200"
                style={{
                  backgroundColor: COLORS.gold,
                  color: "#000",
                }}
              >
                <Upload size={18} /> Add Video
              </button>
            </div>
          </div>
        </div>

        {/* Topic Selection with Counts */}
        <div className="mb-2 mt-6">
          <div className="flex items-center gap-4 mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: COLORS.text }}
            >
              Topics
            </h2>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: COLORS.border }}
            ></div>
          </div>

          <div className="flex flex-wrap gap-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 group"
                style={{
                  backgroundColor:
                    selectedTopic === topic.id
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.05)",
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Folder size={20} />
                <span>{topic.name}</span>
               
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar and Video Count */}
        <div className="mb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2
                className="text-lg font-semibold"
                style={{ color: COLORS.text }}
              >
                Videos
              </h2>
              <span
                className="px-2 py-1 text-xs rounded-full font-medium"
                style={{
                  backgroundColor: "rgba(255,215,0,0.1)",
                  color: COLORS.gold,
                }}
              >
                {filteredVideos.length} videos
              </span>
            </div>
            
            <div className="relative max-w-md w-full md:w-auto">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                size={20}
                style={{ color: COLORS.text, opacity: 0.5 }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by title..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                }}
              />
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2"
          style={{ maxHeight: "calc(100vh - 320px)" }}
        >
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="rounded-2xl px-5 py-4 transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: "rgba(255,215,0,0.1)" }}
                  >
                    {video.type === "youtube" ? (
                      <Link size={20} style={{ color: COLORS.red }} />
                    ) : (
                      <File size={20} style={{ color: COLORS.blue }} />
                    )}
                  </div>
                  <div>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full mb-1 inline-block"
                      style={{
                        backgroundColor:
                          video.type === "youtube"
                            ? "rgba(239, 68, 68, 0.1)"
                            : "rgba(59, 130, 246, 0.1)",
                        color:
                          video.type === "youtube" ? COLORS.red : COLORS.blue,
                      }}
                    >
                      {video.type === "youtube" ? "YouTube" : "File"}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowDeleteConfirm(video.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: COLORS.red }}
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  {/* Delete Confirmation Popup */}
                  {showDeleteConfirm === video.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg z-10"
                      style={{
                        backgroundColor: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div className="p-3">
                        <p className="text-sm mb-3" style={{ color: COLORS.text }}>
                          Delete this video?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 py-1.5 text-xs rounded-lg font-medium"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.05)",
                              color: COLORS.text,
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="flex-1 py-1.5 text-xs rounded-lg font-medium"
                            style={{
                              backgroundColor: COLORS.red,
                              color: "#FFFFFF",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <h3
                className="text-lg font-semibold mb-0 line-clamp-2"
                style={{ color: COLORS.text }}
              >
                {video.title}
              </h3>

              <div
                className="flex items-center justify-between text-sm mb-2"
                style={{ color: COLORS.text, opacity: 0.7 }}
              >
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
              </div>

              <div
                className="flex gap-2 mt-0 pt-3 border-t"
                style={{ borderColor: COLORS.border }}
              >
                <button
                  onClick={() => handlePlayVideo(video)}
                  className="flex-1 cursor-pointer py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white/10"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: COLORS.text,
                  }}
                >
                  <Play size={16} /> Play
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <Video
              className="mx-auto mb-4"
              size={64}
              style={{ color: COLORS.text, opacity: 0.3 }}
            />
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: COLORS.text }}
            >
              {searchQuery ? "No videos found" : "No videos yet"}
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: COLORS.text, opacity: 0.7 }}
            >
              {searchQuery 
                ? "Try different search terms" 
                : "Add your first video to this topic"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 mx-auto transition-all duration-200"
                style={{
                  backgroundColor: COLORS.gold,
                  color: "#000",
                }}
              >
                <Upload size={18} /> Upload First Video
              </button>
            )}
          </div>
        )}

        {/* Add Topic Modal */}
        {showAddTopic && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.text }}
                >
                  Create New Topic
                </h2>
                <button
                  onClick={() => setShowAddTopic(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: COLORS.text }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="Enter topic name"
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddTopic(false)}
                    className="flex-1 py-3 rounded-lg font-medium"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: COLORS.text,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTopic}
                    className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: COLORS.gold,
                      color: "#000",
                    }}
                  >
                    <Check size={18} /> Create Topic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Video Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50 overflow-y-auto py-4">
            <div
              className="w-full max-w-lg rounded-2xl p-6"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div className="flex items-center justify-between mb-0">
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.text }}
                >
                  Add New Video
                </h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: COLORS.text }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Select Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                  >
                    {topics.map((topic) => (
                      <option className="bg-gray-600" key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter video title"
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                    }}
                  />
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Thumbnail Image
                  </label>

                  <div
                    className="border-2 border-dashed rounded-lg px-6 py-4 text-center"
                    style={{ borderColor: COLORS.border }}
                  >
                    {thumbnail ? (
                      <img
                        src={URL.createObjectURL(thumbnail)}
                        alt="Thumbnail Preview"
                        className="mx-auto mb-3 rounded-lg max-h-20 object-cover"
                      />
                    ) : (
                      <p
                        className="text-sm mb-3"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        Upload thumbnail image (JPG / PNG)
                      </p>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files[0])}
                      className="hidden"
                      id="thumbnailFile"
                    />

                    <label
                      htmlFor="thumbnailFile"
                      className="inline-block px-4 py-2 text-sm rounded-lg font-medium cursor-pointer"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        color: COLORS.text,
                      }}
                    >
                      {thumbnail ? "Change Thumbnail" : "Browse Image"}
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setUploadType("youtube")}
                      className={`flex-1 py-3 rounded-lg font-medium ${uploadType === "youtube" ? "" : "opacity-70"}`}
                      style={{
                        backgroundColor:
                          uploadType === "youtube"
                            ? "rgba(239, 68, 68, 0.1)"
                            : "rgba(255,255,255,0.05)",
                        color:
                          uploadType === "youtube" ? COLORS.red : COLORS.text,
                        border: `1px solid ${uploadType === "youtube" ? COLORS.red : COLORS.border}`,
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Link size={18} /> YouTube Link
                      </div>
                    </button>
                    <button
                      onClick={() => setUploadType("file")}
                      className={`flex-1 py-3 rounded-lg font-medium ${uploadType === "file" ? "" : "opacity-70"}`}
                      style={{
                        backgroundColor:
                          uploadType === "file"
                            ? "rgba(59, 130, 246, 0.1)"
                            : "rgba(255,255,255,0.05)",
                        color:
                          uploadType === "file" ? COLORS.blue : COLORS.text,
                        border: `1px solid ${uploadType === "file" ? COLORS.blue : COLORS.border}`,
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <File size={18} /> Upload File
                      </div>
                    </button>
                  </div>

                  {uploadType === "youtube" ? (
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                    />
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg px-8 py-4 text-center"
                      style={{ borderColor: COLORS.border }}
                    >
                      <Upload
                        className="mx-auto mb-3"
                        size={32}
                        style={{ color: COLORS.text, opacity: 0.5 }}
                      />
                      <p
                        className="text-sm mb-2"
                        style={{ color: COLORS.text }}
                      >
                        {file ? file.name : "Drag & drop video file here"}
                      </p>
                      <p
                        className="text-xs mb-4"
                        style={{ color: COLORS.text, opacity: 0.7 }}
                      >
                        MP4, MOV, AVI • Max 5GB
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                        id="videoFile"
                      />
                      <label
                        htmlFor="videoFile"
                        className="inline-block px-4 py-2 text-sm rounded-lg font-medium cursor-pointer"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          color: COLORS.text,
                        }}
                      >
                        {file ? "Change File" : "Browse Files"}
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-0">
                  <button
                    onClick={() => setShowUpload(false)}
                    className="flex-1 py-3 rounded-lg font-medium"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: COLORS.text,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: COLORS.gold,
                      color: "#000",
                    }}
                  >
                    <Upload size={18} /> Add Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}