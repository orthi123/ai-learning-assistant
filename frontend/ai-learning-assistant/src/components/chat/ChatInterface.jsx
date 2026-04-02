import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };
      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    return "renderMessage";
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
        <div className="w-14 h-14  rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Loading chat history...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white/80 backdrop:blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-linear-to-br from-slate-50/50 via-white/50 to-slate-50/50 ">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-centerh-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadoe-lg shadow-emerald-500/10">
              <MessageSquare
                className="w-8 h-8 text-emerald-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-slate-500">
              Ask me anything about the document!
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}

        <div ref={messagesEndRef} />
        {loading && (
          <div className="flex items-center gap-3 my-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/60">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Input area */}
    </div>
  );
};

export default ChatInterface;
