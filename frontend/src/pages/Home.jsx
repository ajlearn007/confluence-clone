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
  Modal,
} from "antd";
import {
  PlusOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState(null);

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

  const handleDownload = async (doc) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.padding = "20px";
    tempDiv.style.width = "600px";
    tempDiv.style.backgroundColor = "white";
    tempDiv.innerHTML = `
      <h2>${doc.title || "Untitled"}</h2>
      <div>${doc.content || "<i>No content</i>"}</div>
      <p><i>Created at: ${new Date(doc.created_at).toLocaleString()}</i></p>
    `;
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${doc.title?.replace(/\s+/g, "_") || "document"}.pdf`);

    document.body.removeChild(tempDiv);
  };

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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDocuments();
  }, [token, navigate, fetchDocuments]);

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
            📚 Anand's Knowledge Base
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/create")}
            >
              Create
            </Button>
            <Button
              type="default"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
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
                    <EyeOutlined key="view" onClick={() => {
                      setViewDocument(doc);
                      setViewModalOpen(true);
                    }} />,
                    <EditOutlined key="edit" onClick={() => navigate(`/edit/${doc.id}`)} />,
                    <DeleteOutlined key="delete" onClick={() => handleDelete(doc.id)} />,
                    <DownloadOutlined key="download" onClick={() => handleDownload(doc)} />,
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

        {/* 📄 Document View Modal */}
        <Modal
          title={viewDocument?.title || "Untitled"}
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={null}
          width={800}
        >
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: viewDocument?.content || "<i>No content available</i>",
            }}
          />
          <Text type="secondary" className="block mt-4">
            Created at: {viewDocument && new Date(viewDocument.created_at).toLocaleString()}
          </Text>
        </Modal>
      </div>
    </div>
  );
}
