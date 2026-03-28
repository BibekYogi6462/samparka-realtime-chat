// import { createContext, useContext, useState } from "react";

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [roomId, setRoomId] = useState("");
//   const [currentUser, setCurrentUser] = useState("");
//   const [connected, setConnected] = useState(false);

//   return (
//     <ChatContext.Provider
//       value={{
//         roomId,
//         currentUser,
//         connected,
//         setRoomId,
//         setCurrentUser,
//         setConnected,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// const useChatContext = () => useContext(ChatContext);
// export default useChatContext;

import { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Load saved data from localStorage on initial load
  const [roomId, setRoomId] = useState(() => {
    return localStorage.getItem("chatRoomId") || "";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("chatCurrentUser") || "";
  });

  const [connected, setConnected] = useState(() => {
    return localStorage.getItem("chatConnected") === "true";
  });

  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageSearch, setMessageSearch] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [messageDrafts, setMessageDrafts] = useState({});

  // Save to localStorage whenever values change
  useEffect(() => {
    if (roomId) {
      localStorage.setItem("chatRoomId", roomId);
    } else {
      localStorage.removeItem("chatRoomId");
    }
  }, [roomId]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("chatCurrentUser", currentUser);
    } else {
      localStorage.removeItem("chatCurrentUser");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("chatConnected", connected);
  }, [connected]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prev) => [
      {
        id: id,
        read: false,
        timestamp: new Date(),
        ...notification,
      },
      ...prev,
    ]);

    // Auto remove after 5 seconds if it's a toast-type notification
    if (notification.autoDismiss !== false) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    }
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Save message draft
  const saveMessageDraft = (roomId, draft) => {
    setMessageDrafts((prev) => ({
      ...prev,
      [roomId]: draft,
    }));
  };

  // Get message draft
  const getMessageDraft = (roomId) => {
    return messageDrafts[roomId] || "";
  };

  // Clear message draft
  const clearMessageDraft = (roomId) => {
    setMessageDrafts((prev) => {
      const newDrafts = { ...prev };
      delete newDrafts[roomId];
      return newDrafts;
    });
  };

  // Pin message
  const pinMessage = (message) => {
    setPinnedMessages((prev) => {
      // Check if already pinned
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [message, ...prev];
    });
    addNotification({
      type: "success",
      message: "Message pinned successfully",
    });
  };

  // Unpin message
  const unpinMessage = (messageId) => {
    setPinnedMessages((prev) => prev.filter((m) => m.id !== messageId));
    addNotification({
      type: "info",
      message: "Message unpinned",
    });
  };

  // Mute/unmute user
  const toggleMuteUser = (userId) => {
    setMutedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Check if user is muted
  const isUserMuted = (userId) => {
    return mutedUsers.includes(userId);
  };

  // Increment unread count
  const incrementUnreadCount = () => {
    setUnreadCount((prev) => prev + 1);
  };

  // Reset unread count
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  // Clear all chat data (logout)
  const clearChatData = () => {
    setRoomId("");
    setCurrentUser("");
    setConnected(false);
    setTypingUsers([]);
    setUnreadCount(0);
    setNotifications([]);
    setOnlineUsers([]);
    setMessageSearch("");
    setPinnedMessages([]);
    setMutedUsers([]);
    setMessageDrafts({});

    // Clear localStorage
    localStorage.removeItem("chatRoomId");
    localStorage.removeItem("chatCurrentUser");
    localStorage.removeItem("chatConnected");
  };

  // Search messages
  const searchMessages = (messages, query) => {
    if (!query.trim()) return messages;

    return messages.filter(
      (message) =>
        message.content.toLowerCase().includes(query.toLowerCase()) ||
        message.sender.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const value = {
    // Existing states
    roomId,
    currentUser,
    connected,
    darkMode,
    typingUsers,
    unreadCount,
    notifications,
    onlineUsers,
    messageSearch,
    pinnedMessages,
    mutedUsers,
    messageDrafts,

    // Existing setters
    setRoomId,
    setCurrentUser,
    setConnected,
    setTypingUsers,
    setOnlineUsers,

    // New setters
    setMessageSearch,

    // Functions
    toggleDarkMode,
    addNotification,
    markNotificationRead,
    clearNotifications,
    saveMessageDraft,
    getMessageDraft,
    clearMessageDraft,
    pinMessage,
    unpinMessage,
    toggleMuteUser,
    isUserMuted,
    incrementUnreadCount,
    resetUnreadCount,
    clearChatData,
    searchMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export default useChatContext;
