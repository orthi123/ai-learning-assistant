// models/Notification.js
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  type: { type: String, default: "info" }, // e.g., 'flashcard', 'quiz', 'system'
  isRead: { type: Boolean, default: false },
  link: { type: String }, // ক্লিক করলে কোন পেজে যাবে (যেমন: /flashcards/id)
  createdAt: { type: Date, default: Date.now },
});
