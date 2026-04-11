// controllers/notificationController.js
const createNotification = async (userId, message, link) => {
  const notification = new Notification({
    recipient: userId,
    message,
    link,
  });
  await notification.save();
  // এখানে Socket.io থাকলে রিয়েল-টাইম পুশ করা হয়
};
