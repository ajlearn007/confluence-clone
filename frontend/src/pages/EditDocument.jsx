import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditDocument() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch document on mount
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get("/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const doc = res.data.find((d) => d.id === parseInt(id));
        if (!doc) {
          alert("Document not found or not authorized");
          navigate("/");
          return;
        }

        setTitle(doc.title);
        setContent(doc.content);
      } catch (err) {
        console.error("Failed to fetch document:", err);
        alert("Error loading document");
      }
    };

    fetchDoc();
  }, [id, token, navigate]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `/documents/${id}`,
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update document");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl mb-4">✏️ Edit Document</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border px-4 py-2 mb-4"
      />
      <ReactQuill value={content} onChange={setContent} className="mb-4" />
      <button
        onClick={handleUpdate}
        disabled={!title.trim() || !content.trim()}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        ✅ Save Changes
      </button>
    </div>
  );
}
