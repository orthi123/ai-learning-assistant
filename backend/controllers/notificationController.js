// controllers/notificationController.js
const createNotification = async (userId, message, link) => {
  const notification = new Notification({
    recipient: userId,
    message,
    link,
  });
  await notification.save();
  // ekhane Socket.io thakle real-time push kora hoy----------
  //link maane kun notification e ashche sheta dekhanor jonno---------
  //notification file laagbe naile notification ahriye jaabe------------
};
