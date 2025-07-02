import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Input, Button, Typography, message, Card, Select } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Title } = Typography;
const { Option } = Select;

export default function CreateDocument() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("private"); // default value
  const navigate = useNavigate();

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!title.trim() || !content.trim()) {
      message.warning("Title and content are required.");
      return;
    }

    try {
      await axios.post(
        "/documents",
        { title, content, visibility },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Document created!");
      navigate("/", { replace: true });
      window.location.reload(); // force fetch on Home
    } catch (err) {
      console.error("Failed to save document:", err);
      message.error("Failed to create document.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-3xl p-6 rounded-xl shadow-lg">
        <Title level={2} className="text-center text-blue-600 mb-6">
          📝 Create New Document
        </Title>

        <Input
          placeholder="Enter document title"
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
          onChange={(value) => setVisibility(value)}
          size="large"
          className="mb-6 w-full"
        >
          <Option value="private">🔒 Private</Option>
          <Option value="public">🌐 Public</Option>
        </Select>

        <Button
          type="primary"
          block
          size="large"
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}
        >
          💾 Save Document
        </Button>
      </Card>
    </div>
  );
}
