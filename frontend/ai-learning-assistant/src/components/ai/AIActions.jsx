import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";

const AIActions = () => {
    const { id: documentId } = useParams();
    const [loadingAction, setLoadingAction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [concept, setConcept] = useState("");

    const handleGenerateSummary = async () => {
      setLoadingAction("summary");
      try {
        const { summary } = await aiService.generateSummary(documentId);
        setModalTitle("Generated Summary");
        setModalContent(summary);
        setIsModalOpen(true);
      } catch (error) {
        toast.error("Failed to generate summary.");
      } finally {
        setLoadingAction(null);
      }
    };

    const handleExplainConcept = async (e) => {
      e.preventDefault();
      if (!concept.trim()) {
        toast.error("Please enter a concept to explain.");
        return;
      }
      setLoadingAction("explain");
      try {
        const { explanation } = await aiService.explainConcept(
          documentId,
          concept,
        );
        setModalTitle(`Explanation of "${concept}"`);
        setModalContent(explanation);
        setIsModalOpen(true);
        setConcept("");
      } catch (error) {
        toast.error("Failed to explain concept.");
      } finally {
        setLoadingAction(null);
      }
    };


  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-purple-500/25 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500">Powered by advanced AI</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Generate Summary */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" strokeWidth={2} />
                  </div>

                  <h4 className="font-semibold text-slate-900">Generate Summary</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Get a concise summary of the entire document.
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="shrink-0 h-10 px-5 bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loadingAction === "summary" ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 borer-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Summarize"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  ); 
};

export default AIActions;
