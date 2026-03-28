
import axios from "axios";

export const baseURL = "http://localhost:8080";

export const httpClient = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

// Time formatting utilities
export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const secondsAgo = Math.floor((now - past) / 1000);

  if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) return `${daysAgo} days ago`;
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) return `${monthsAgo} months ago`;
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo} years ago`;
}

// Format time for message grouping
export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }
}

// File size formatter
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Generate random color from username
export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
}

// Generate avatar initials
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Debounce function for search/typing
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Throttle function for scroll events
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}

// Validate room ID
export function isValidRoomId(roomId) {
  const roomIdRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return roomIdRegex.test(roomId);
}

// Validate username
export function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

// Escape HTML to prevent XSS
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Detect URLs in text and convert to clickable links
export function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
  });
}

// Group messages by date
export function groupMessagesByDate(messages) {
  const groups = {};
  messages.forEach((message) => {
    const date = new Date(message.timeStamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  return groups;
}

// Search in messages
export function searchInMessages(messages, query) {
  if (!query.trim()) return messages;
  const lowerQuery = query.toLowerCase();
  return messages.filter(
    (message) =>
      message.content.toLowerCase().includes(lowerQuery) ||
      message.sender.toLowerCase().includes(lowerQuery),
  );
}

// Generate random ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if message contains emoji
export function containsEmoji(text) {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
}

// Get file icon based on file type
export function getFileIcon(fileType) {
  const icons = {
    image: "🖼️",
    video: "🎥",
    audio: "🎵",
    pdf: "📄",
    word: "📝",
    excel: "📊",
    powerpoint: "📽️",
    zip: "📦",
    text: "📃",
    code: "</>",
    default: "📎",
  };

  if (fileType.includes("image")) return icons.image;
  if (fileType.includes("video")) return icons.video;
  if (fileType.includes("audio")) return icons.audio;
  if (fileType.includes("pdf")) return icons.pdf;
  if (fileType.includes("word")) return icons.word;
  if (fileType.includes("excel")) return icons.excel;
  if (fileType.includes("powerpoint")) return icons.powerpoint;
  if (fileType.includes("zip")) return icons.zip;
  if (fileType.includes("text")) return icons.text;
  if (
    fileType.includes("javascript") ||
    fileType.includes("json") ||
    fileType.includes("html")
  )
    return icons.code;

  return icons.default;
}

// Detect message type
export function getMessageType(content) {
  if (
    content.startsWith("http") &&
    (content.endsWith(".jpg") ||
      content.endsWith(".png") ||
      content.endsWith(".gif"))
  ) {
    return "image";
  }
  if (
    content.startsWith("http") &&
    (content.endsWith(".mp4") || content.endsWith(".webm"))
  ) {
    return "video";
  }
  if (
    content.startsWith("http") &&
    (content.endsWith(".mp3") || content.endsWith(".wav"))
  ) {
    return "audio";
  }
  return "text";
}

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  },
};

// Scroll to element with smooth behavior
export function scrollToElement(element, behavior = "smooth") {
  if (element) {
    element.scrollIntoView({ behavior, block: "end" });
  }
}

// Check if element is in viewport
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Generate random avatar URL
export function getRandomAvatar(username) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=40&rounded=true`;
}

// Format message count
export function formatMessageCount(count) {
  if (count < 1000) return count;
  if (count < 1000000) return (count / 1000).toFixed(1) + "k";
  return (count / 1000000).toFixed(1) + "m";
}

// Get time of day greeting
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Example usage
console.log(timeAgo("2023-12-01T14:00:00Z")); // Output depends on the current time
