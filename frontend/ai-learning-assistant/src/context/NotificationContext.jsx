import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Welcome to AI Learning Assistant!", isRead: false },
  ]);

  // নতুন নোটিফিকেশন যোগ করার ফাংশন
  const addNotification = (message) => {
    const newNotif = {
      id: Date.now(),
      message: message,
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // পড়া হয়েছে হিসেবে মার্ক করা
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  // সব নোটিফিকেশন মুছে ফেলা
  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
