import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreateDocument() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/documents", {
  title,
  content,
}, {
  headers: {
    Authorization: `Bearer ${token}`, 
  },
});

      navigate("/");
    } catch (err) {
      console.error("Failed to save document:", err); // ESLint: using err now
      alert("Failed to save document");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl mb-4">📝 Create New Document</h1>
      <input
        type="text"
        placeholder="Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border px-4 py-2 mb-4"
      />
      <ReactQuill value={content} onChange={setContent} className="mb-4" />
      <button
        onClick={handleSave}
        disabled={!title.trim() || !content.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        💾 Save
      </button>
    </div>
  );
}
