import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import { Input, Button, Typography, message, Card, Select } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Title } = Typography;
const { Option } = Select;

export default function EditDocument() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("private");

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get("/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const doc = res.data.find((d) => d.id === parseInt(id));
        if (!doc) {
          message.error("Document not found or unauthorized");
          navigate("/");
          return;
        }

        setTitle(doc.title);
        setContent(doc.content);
        setVisibility(doc.visibility || "private"); // fallback
      } catch (err) {
        console.error("Failed to fetch document:", err);
        message.error("Error loading document");
      }
    };

    fetchDoc();
  }, [id, token, navigate]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning("Title and content cannot be empty");
      return;
    }

    try {
      await axios.put(
        `/documents/${id}`,
        { title, content, visibility },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Document updated!");
      navigate("/");
    } catch (err) {
      console.error("Update failed:", err);
      message.error("Failed to update document");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-4xl p-6 rounded-xl shadow-xl">
        <Title level={2} className="text-green-700 mb-6 text-center">
          ✏️ Edit Document
        </Title>

        <Input
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="large"
          className="mb-4"
        />

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="mb-6"
          style={{ height: 200 }}
        />

        <Select
          value={visibility}
          onChange={setVisibility}
          size="large"
          className="mb-6 w-full"
        >
          <Option value="private">🔒 Private</Option>
          <Option value="public">🌐 Public</Option>
        </Select>

        <Button
          type="primary"
          size="large"
          block
          className="bg-green-600 hover:bg-green-700"
          onClick={handleUpdate}
          disabled={!title.trim() || !content.trim()}
        >
          ✅ Save Changes
        </Button>
      </Card>
    </div>
  );
}
