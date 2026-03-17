import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

// @desc    Generate flashcards from document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count),
    );

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
        lastReviewed: null,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate quiz from document
// @route   POST /api/ai/generate-quiz
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5 } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    const questions = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(numQuestions),
    );

    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      questions: questions.map((q) => ({
        ...q,
        userAnswer: null,
        isCorrect: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate document summary
// @route   POST /api/ai/generate-summary
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    const summary = await geminiService.generateSummary(document.extractedText);

    // Update document with summary
    document.summary = summary;
    await document.save();

    res.status(200).json({
      success: true,
      data: summary,
      message: "Summary generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with document
// @route   POST /api/ai/chat
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // RAG: Find relevant chunks from document text
    const chunks = findRelevantChunks(document.extractedText, question);

    const answer = await geminiService.chatWithContext(question, chunks);

    // Save to ChatHistory
    await ChatHistory.create({
      userId: req.user._id,
      documentId: document._id,
      role: "user",
      content: question,
    });

    const aiResponse = await ChatHistory.create({
      userId: req.user._id,
      documentId: document._id,
      role: "assistant",
      content: answer,
    });

    res.status(200).json({
      success: true,
      data: aiResponse,
      message: "Chat response generated",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain concept from document
// @route   POST /api/ai/explain-concept
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    const document = await Document.findOne({ _id: documentId });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const explanation = await geminiService.explainConcept(
      concept,
      document.extractedText,
    );

    res.status(200).json({
      success: true,
      data: explanation,
      message: "Concept explained successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const history = await ChatHistory.find({
      documentId,
      userId: req.user._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
