import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [documents, setDocuments] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      // Fetch documents
      axios
        .get("/documents", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setDocuments(res.data))
        .catch((err) => {
          console.error("Failed to fetch documents", err);
          alert("Failed to load documents");
        });
    }
  }, [token, navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">📚 Knowledge Base Home</h1>
      <p>Welcome! You're logged in.</p>
      <div className="flex gap-4 mt-6 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/create")}
        >
          ➕ Create Document
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleLogout}
        >
          🔓 Logout
        </button>
      </div>

      {/* 🗂️ Document List */}
      {documents.length > 0 ? (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border p-4 rounded shadow hover:bg-gray-50 transition"
            >
              <h2 className="text-xl font-semibold">{doc.title}</h2>
              <p
                className="text-sm text-gray-500"
                dangerouslySetInnerHTML={{
                  __html: doc.content.substring(0, 100) + "...",
                }}
              ></p>
              <p className="text-xs mt-2 text-gray-400">
                Created at: {new Date(doc.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No documents found.</p>
      )}
    </div>
  );
}
