import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Typography,
  message,
  Empty,
} from "antd";
import {
  PlusOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      message.success("Document deleted");
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete document");
    }
  };

  // ✅ Stable version of fetchDocuments
  const fetchDocuments = useCallback(
    async (q = "") => {
      try {
        const endpoint = q.trim()
          ? `/documents/search?q=${encodeURIComponent(q)}`
          : "/documents";
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
        message.error("Failed to load documents");
      }
    },
    [token]
  );

  // Initial load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDocuments();
  }, [token, navigate, fetchDocuments]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDocuments(searchQuery);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, fetchDocuments]);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <Title level={2} className="!mb-0 text-blue-600">
            📚 Anand's knowledge Base
          </Title>
          <Space wrap>
            <Input
              placeholder="Search documents..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/create")}>
              Create
            </Button>
            <Button type="default" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </div>

        {documents.length > 0 ? (
          <Row gutter={[16, 16]}>
            {documents.map((doc) => (
              <Col key={doc.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  title={doc.title || "Untitled"}
                  actions={[
                    <EditOutlined key="edit" onClick={() => navigate(`/edit/${doc.id}`)} />,
                    <DeleteOutlined key="delete" onClick={() => handleDelete(doc.id)} />,
                  ]}
                  style={{ borderRadius: 16, minHeight: 260 }}
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
          <Empty description="No documents found" className="mt-20" />
        )}
      </div>
    </div>
  );
}
