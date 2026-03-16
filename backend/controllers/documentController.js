import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

// @desc    Upload PDF document
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;
    if (!title) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
    });

    // DEBUGGING TIP: Ekhane amra 'await' korbo jate error terminal-e dekha jay
    // Production-e 'await' soriye background-e pathano jay
    try {
      await processPDF(document._id, req.file.path);
    } catch (err) {
      console.error("CRITICAL PROCESSING ERROR:", err.message);
    }

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded and processed.",
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// Helper function to process PDF logic
const processPDF = async (documentId, filePath) => {
  try {
    console.log(`\n>>> STARTING: ${documentId}`);
    console.log(`>>> FILE PATH: ${filePath}`);

    // 1. Extract Text
    const extractedData = await extractTextFromPDF(filePath);

    if (
      !extractedData ||
      !extractedData.text ||
      extractedData.text.trim() === ""
    ) {
      throw new Error("PDF parse result is empty or invalid.");
    }
    console.log(
      `>>> STEP 1: Extracted ${extractedData.text.length} characters.`,
    );

    // 2. Chunk Text
    const chunks = chunkText(extractedData.text, 500, 50);
    console.log(`>>> STEP 2: Created ${chunks.length} chunks.`);

    // 3. Update Database
    const updatedDoc = await Document.findByIdAndUpdate(
      documentId,
      {
        extractedText: extractedData.text,
        chunks: chunks,
        status: "ready",
      },
      { new: true },
    );

    if (updatedDoc) {
      console.log(`>>> SUCCESS: Document is now READY`);
    }
  } catch (error) {
    console.error(`\n!!! PROCESSING FAILED !!!`);
    console.error(`Reason: ${error.message}`);

    await Document.findByIdAndUpdate(documentId, { status: "failed" });
    throw error; // Throwing so the controller can log it
  }
};

// @desc    Get all user documents
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: { extractedText: 0, chunks: 0, flashcardSets: 0, quizzes: 0 },
      },
      { $sort: { uploadDate: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document title
export const updateDocument = async (req, res, next) => {
  try {
    const { title } = req.body;
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true, runValidators: true },
    );

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};
