import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Trash2, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // Helper function to get the full PDF URL
  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;

    // Check if filePath is already a full URL (starts with http or https)
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    // Set baseUrl for local server environment
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

    // Ensure correct slash (/) handling between baseUrl and filePath
    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return;

      <Spinner />;
    }

    if (!document || !document.data || !document.data.filePath) {
      return <div className="text-center p-8">PDF not available</div>;
    }

    const pdfUrl = getPdfUrl();
    // Your remaining JSX code goes here (e.g., PDF Viewer or Tabs)
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">
            Document Viewer
          </span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 fon-medium transition-colors"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            className="w-full h-[70vh] bg-white border border-gray-300"
            title="PDF Viewer"
            frameBorder="0"
            style={{
              colorScheme: "light",
            }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return "renderChat";
  };
  const renderAIActions = () => {
    return "renderAIActions";
  };
  const renderFlashcardsTab = () => {
    return "renderFlashcardsTab";
  };
  const renderQuizzesTab = () => {
    return "renderQuizzesTab";
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: renderChat() },
    { name: "AI Actions", label: "AI Actions", content: renderAIActions() },
    { name: "Flashcards", label: "Flashcards", content: renderFlashcardsTab() },
    { name: "Quizzes", label: "Quizzes", content: renderQuizzesTab() },
  ];

  if (loading) {
    return <Spinner />;
  }
  if (!document) {
    return <div className="text-center p-8">Document not found.</div>;
  }

  return <div>DocumentDetailPage</div>;
};

export default DocumentDetailPage;