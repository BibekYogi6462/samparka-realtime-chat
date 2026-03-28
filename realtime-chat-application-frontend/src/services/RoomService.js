// import { httpClient } from "../config/AxiosHelper";

// export const createRoomApi = async (roomDetail) => {
//   const respone = await httpClient.post(`/api/v1/rooms`, roomDetail, {
//     headers: {
//       "Content-Type": "text/plain",
//     },
//   });
//   return respone.data;
// };

// export const joinChatApi = async (roomId) => {
//   const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
//   return response.data;
// };

// export const getMessagess = async (roomId, size = 50, page = 0) => {
//   const response = await httpClient.get(
//     `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`,
//   );
//   return response.data;
// };
import { httpClient } from "../config/AxiosHelper";

// Room Management
export const createRoomApi = async (roomDetail) => {
  // Fix: Send as JSON, not text/plain
  const response = await httpClient.post(`/api/v1/rooms`, roomDetail, {
    headers: {
      "Content-Type": "application/json", // Changed from text/plain
    },
  });
  return response.data;
};

export const joinChatApi = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
  return response.data;
};

export const getRoomDetails = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}/details`);
  return response.data;
};

export const getAllRooms = async () => {
  const response = await httpClient.get(`/api/v1/rooms`);
  return response.data;
};

export const deleteRoom = async (roomId) => {
  const response = await httpClient.delete(`/api/v1/rooms/${roomId}`);
  return response.data;
};

// Message Management
export const getMessages = async (roomId, size = 50, page = 0) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`,
  );
  return response.data;
};

export const sendMessage = async (roomId, message) => {
  const response = await httpClient.post(
    `/api/v1/rooms/${roomId}/messages`,
    message,
  );
  return response.data;
};

export const deleteMessage = async (roomId, messageId) => {
  const response = await httpClient.delete(
    `/api/v1/rooms/${roomId}/messages/${messageId}`,
  );
  return response.data;
};

export const editMessage = async (roomId, messageId, content) => {
  const response = await httpClient.put(
    `/api/v1/rooms/${roomId}/messages/${messageId}`,
    { content },
  );
  return response.data;
};

export const getMessageById = async (roomId, messageId) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages/${messageId}`,
  );
  return response.data;
};

// File Upload
export const uploadFile = async (formData) => {
  const response = await httpClient.post(`/api/v1/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadMultipleFiles = async (formData) => {
  const response = await httpClient.post(`/api/v1/upload/multiple`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getFile = async (fileId) => {
  const response = await httpClient.get(`/api/v1/files/${fileId}`, {
    responseType: "blob",
  });
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await httpClient.delete(`/api/v1/files/${fileId}`);
  return response.data;
};

// Reactions
export const addReaction = async (roomId, messageId, reaction) => {
  const response = await httpClient.post(
    `/api/v1/rooms/${roomId}/messages/${messageId}/reactions`,
    { reaction },
  );
  return response.data;
};

export const removeReaction = async (roomId, messageId, reaction) => {
  const response = await httpClient.delete(
    `/api/v1/rooms/${roomId}/messages/${messageId}/reactions/${reaction}`,
  );
  return response.data;
};

export const getMessageReactions = async (roomId, messageId) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages/${messageId}/reactions`,
  );
  return response.data;
};

// User Management in Room
export const getRoomUsers = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}/users`);
  return response.data;
};

export const getUserStatus = async (userId) => {
  const response = await httpClient.get(`/api/v1/users/${userId}/status`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await httpClient.get(`/api/v1/users`);
  return response.data;
};

// Typing Indicators
export const sendTypingIndicator = async (roomId, userId, isTyping) => {
  const response = await httpClient.post(`/api/v1/rooms/${roomId}/typing`, {
    userId,
    typing: isTyping,
  });
  return response.data;
};

// Message Search
export const searchMessages = async (roomId, query, size = 20, page = 0) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages/search?q=${query}&size=${size}&page=${page}`,
  );
  return response.data;
};

// Pinned Messages
export const pinMessage = async (roomId, messageId) => {
  const response = await httpClient.post(
    `/api/v1/rooms/${roomId}/pinned-messages/${messageId}`,
  );
  return response.data;
};

export const unpinMessage = async (roomId, messageId) => {
  const response = await httpClient.delete(
    `/api/v1/rooms/${roomId}/pinned-messages/${messageId}`,
  );
  return response.data;
};

export const getPinnedMessages = async (roomId) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/pinned-messages`,
  );
  return response.data;
};

// Read Receipts
export const markMessageAsRead = async (roomId, messageId) => {
  const response = await httpClient.post(
    `/api/v1/rooms/${roomId}/messages/${messageId}/read`,
  );
  return response.data;
};

export const getMessageReadReceipts = async (roomId, messageId) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages/${messageId}/read-receipts`,
  );
  return response.data;
};

// Voice Messages
export const uploadVoiceMessage = async (roomId, audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice-message.webm");
  formData.append("roomId", roomId);

  const response = await httpClient.post(`/api/v1/upload/voice`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Analytics
export const getRoomAnalytics = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}/analytics`);
  return response.data;
};

export const getUserAnalytics = async (userId) => {
  const response = await httpClient.get(`/api/v1/users/${userId}/analytics`);
  return response.data;
};

// Export/Import Messages
export const exportMessages = async (roomId, format = "json") => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages/export?format=${format}`,
    {
      responseType: "blob",
    },
  );
  return response.data;
};

export const importMessages = async (roomId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await httpClient.post(
    `/api/v1/rooms/${roomId}/messages/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Notification Settings
export const updateNotificationSettings = async (userId, settings) => {
  const response = await httpClient.put(
    `/api/v1/users/${userId}/notification-settings`,
    settings,
  );
  return response.data;
};

export const getNotificationSettings = async (userId) => {
  const response = await httpClient.get(
    `/api/v1/users/${userId}/notification-settings`,
  );
  return response.data;
};

// Message Templates
export const getMessageTemplates = async () => {
  const response = await httpClient.get(`/api/v1/message-templates`);
  return response.data;
};

export const createMessageTemplate = async (template) => {
  const response = await httpClient.post(`/api/v1/message-templates`, template);
  return response.data;
};

// Helper function to get file URL
export const getFileUrl = (fileId) => {
  return `${httpClient.defaults.baseURL}/api/v1/files/${fileId}`;
};

// Helper function to get avatar URL
export const getAvatarUrl = (userId) => {
  return `${httpClient.defaults.baseURL}/api/v1/users/${userId}/avatar`;
};

// Export the old getMessagess for backward compatibility
export const getMessagess = getMessages;
