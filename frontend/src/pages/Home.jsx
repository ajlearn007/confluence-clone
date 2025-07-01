import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Button, Card, Col, Row, Space, Typography } from "antd";

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [documents, setDocuments] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this document?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete document");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDocuments = async () => {
      try {
        const res = await axios.get("/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched Documents:", res.data); // ✅ Debug log
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
        alert("Failed to load documents");
      }
    };

    fetchDocuments();
  }, [token, navigate]);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="!mb-0 text-blue-600">
            📚 Knowledge Base
          </Title>
          <Space>
            <Button type="primary" onClick={() => navigate("/create")}>
              ➕ Create
            </Button>
            <Button type="default" danger onClick={handleLogout}>
              🔓 Logout
            </Button>
          </Space>
        </div>

        {documents.length > 0 ? (
          <Row gutter={[16, 16]}>
            {documents.map((doc) => (
              <Col key={doc.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  title={doc.title || "Untitled"}
                  extra={
                    <Space>
                      <Button type="link" onClick={() => navigate(`/edit/${doc.id}`)}>
                        ✏️ Edit
                      </Button>
                      <Button type="link" danger onClick={() => handleDelete(doc.id)}>
                        🗑️ Delete
                      </Button>
                    </Space>
                  }
                  style={{ borderRadius: 16, minHeight: 250 }}
                >
                  <div
                    className="text-gray-600 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: doc.content?.substring(0, 150) || "<i>No preview</i>",
                    }}
                  />
                  <Text type="secondary" className="text-xs block mt-2">
                    Created at: {new Date(doc.created_at).toLocaleString()}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-gray-500 text-center">No documents found.</p>
        )}
      </div>
    </div>
  );
}
