import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

// @desc    Get user learning statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    // Eikhane 'uId' define kora hoyeche
    const uId = req.user._id;

    // Get counts - shob jaygay 'userId: uId' ensure kora hoyeche
    const totalDocuments = await Document.countDocuments({ userId: uId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId: uId });
    const totalQuizzes = await Quiz.countDocuments({ userId: uId });
    const completedQuizzes = await Quiz.countDocuments({
      userId: uId,
      completedAt: { $ne: null },
    });

    // Get flashcard statistics
    const flashcardSets = await Flashcard.find({ userId: uId });
    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter((c) => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter((c) => c.isStarred).length;
    });

    // Get quiz statistics
    const quizzes = await Quiz.find({
      userId: uId,
      completedAt: { $ne: null },
    });
    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length,
          )
        : 0;

    // Recent activity - query gulo fix kora hoyeche
    const recentDocuments = await Document.find({ userId: uId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select("title fileName lastAccessed status");

    const recentQuizzes = await Quiz.find({ userId: uId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("documentId", "title")
      // createdAt add kora hoyeche frontend-er "Invalid Date" fix korar jonno
      .select("title score totalQuestions completedAt createdAt");

    // Study streak (mock data)
    const studyStreak = Math.floor(Math.random() * 7) + 1;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//.ne operator-er mane ki?Uttor: $ne mane holo Not Equal। Amra check korchi completedAt field-ta jeno null na hoy।