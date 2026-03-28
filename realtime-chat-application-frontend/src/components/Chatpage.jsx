import React, { useEffect, useRef, useState } from "react";
import {
  MdAttachFile,
  MdSend,
  MdDarkMode,
  MdLightMode,
  MdEmojiEmotions,
  MdReply,
  MdDelete,
  MdEdit,
  MdCopyAll,
  MdVolumeUp,
  MdVolumeOff,
} from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess, uploadFile } from "../services/RoomService";
import { timeAgo } from "../config/helper";
import EmojiPicker from "emoji-picker-react";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
    darkMode,
    toggleDarkMode,
  } = useChatContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  // Add this useEffect to log session data on page load
  useEffect(() => {
    console.log("ChatPage mounted with session:", {
      roomId,
      currentUser,
      connected,
    });
    if (connected && roomId && currentUser) {
      // Session is restored, WebSocket will reconnect automatically
      toast.success(`Welcome back ${currentUser}!`);
    }
  }, []);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [stompClient, setStompClient] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        console.log("Loaded messages:", messages);
        setMessages(messages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
    if (connected && roomId) {
      loadMessages();
    }
  }, [roomId, connected]);

  // Scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!connected || !roomId) {
      console.log("Cannot connect WebSocket - missing roomId or not connected");
      return;
    }

    console.log("Connecting WebSocket for room:", roomId);
    const sock = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(sock);

    client.connect(
      {},
      (frame) => {
        console.log("✅ WebSocket connected!", frame);
        setStompClient(client);
        toast.success("Connected to chat!");

        // Subscribe to room messages
        const topic = `/topic/room/${roomId}`;
        console.log("Subscribing to:", topic);

        client.subscribe(topic, (message) => {
          console.log("📨 Message received:", message.body);
          try {
            const newMessage = JSON.parse(message.body);
            console.log("Parsed message:", newMessage);

            setMessages((prev) => {
              // Check if message already exists to avoid duplicates
              if (
                prev.some(
                  (m) =>
                    m.id === newMessage.id &&
                    m.timeStamp === newMessage.timeStamp,
                )
              ) {
                return prev;
              }
              return [...prev, newMessage];
            });
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });

        // Subscribe to typing indicators
        client.subscribe(`/topic/typing/${roomId}`, (message) => {
          const typingData = JSON.parse(message.body);
          if (typingData.sender !== currentUser) {
            setTypingUsers((prev) => {
              if (typingData.typing) {
                return [...new Set([...prev, typingData.sender])];
              } else {
                return prev.filter((user) => user !== typingData.sender);
              }
            });
          }
        });
      },
      (error) => {
        console.error("❌ WebSocket connection failed:", error);
        toast.error("Failed to connect to chat server");
      },
    );

    return () => {
      if (client && client.connected) {
        console.log("Disconnecting WebSocket...");
        client.disconnect();
      }
    };
  }, [roomId, connected, currentUser]);

  // Handle typing indicator
  const handleTyping = () => {
    if (stompClient && connected && currentUser) {
      stompClient.send(
        `/app/typing/${roomId}`,
        {},
        JSON.stringify({
          sender: currentUser,
          typing: true,
        }),
      );

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (stompClient && connected) {
          stompClient.send(
            `/app/typing/${roomId}`,
            {},
            JSON.stringify({
              sender: currentUser,
              typing: false,
            }),
          );
        }
      }, 1000);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!stompClient) {
      console.error("❌ No WebSocket connection");
      toast.error("Not connected to chat server");
      return;
    }

    if (!connected) {
      console.error("❌ Not connected to room");
      toast.error("Not connected to room");
      return;
    }

    if (!input.trim()) {
      return;
    }

    console.log("📤 Sending message:", input);

    const message = {
      sender: currentUser,
      content: input,
      roomId: roomId,
    };

    console.log("Message payload:", message);

    try {
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message),
      );
      console.log("✅ Message sent successfully");
      setInput("");
      setReplyTo(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", roomId);
    formData.append("sender", currentUser);

    try {
      const response = await uploadFile(formData);
      const message = {
        sender: currentUser,
        content: response.fileUrl,
        roomId: roomId,
        type: "file",
        fileName: file.name,
        fileSize: file.size,
      };
      if (stompClient) {
        stompClient.send(
          `/app/sendMessage/${roomId}`,
          {},
          JSON.stringify(message),
        );
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Delete message
  const deleteMessage = (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    toast.success("Message deleted");
  };

  // Edit message
  const editMessage = () => {
    if (editingMessage && input.trim()) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessage.id
            ? { ...msg, content: input, edited: true }
            : msg,
        ),
      );
      setEditingMessage(null);
      setInput("");
      toast.success("Message edited");
    }
  };

  // Copy message to clipboard
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard!");
  };

  // Handle right-click context menu
  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setSelectedMessage(message);
    setShowContextMenu(true);
  };

  // Close context menu
  useEffect(() => {
    const handleClick = () => setShowContextMenu(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function handleLogout() {
    if (stompClient) {
      stompClient.disconnect();
    }
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  // Render message content
  const renderMessageContent = (message) => {
    if (message.type === "file") {
      const isImage = message.content?.match(/\.(jpeg|jpg|gif|png)$/);
      return isImage ? (
        <img
          src={message.content}
          alt="shared"
          className="max-w-xs rounded-lg mt-2"
        />
      ) : (
        <a href={message.content} download className="text-blue-400 underline">
          📎 {message.fileName}
        </a>
      );
    }
    return <p className="break-words">{message.content}</p>;
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <header className="dark:border-gray-700 fixed w-full bg-white dark:bg-gray-800 py-4 shadow-lg flex justify-around items-center z-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">💬</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold dark:text-white">
                Room:{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  {roomId}
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {messages.length} messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {currentUser?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl font-semibold dark:text-white">
                {currentUser}
              </h1>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {audioEnabled ? (
                <MdVolumeUp size={20} />
              ) : (
                <MdVolumeOff size={20} />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-white font-semibold transition"
            >
              Leave Room
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <main
          ref={chatBoxRef}
          className="pt-20 pb-32 px-4 md:px-10 max-w-4xl mx-auto min-h-screen"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">No messages yet.</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${
                message.sender === currentUser ? "justify-end" : "justify-start"
              } mb-4 group relative`}
              onContextMenu={(e) => handleContextMenu(e, message)}
            >
              {/* Context Menu */}
              {showContextMenu && selectedMessage?.id === message.id && (
                <div
                  className="fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50"
                  style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
                >
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left flex items-center gap-2"
                  >
                    <MdCopyAll /> Copy
                  </button>
                  <button
                    onClick={() => setReplyTo(message)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left flex items-center gap-2"
                  >
                    <MdReply /> Reply
                  </button>
                  {message.sender === currentUser && (
                    <>
                      <button
                        onClick={() => {
                          setEditingMessage(message);
                          setInput(message.content);
                          inputRef.current?.focus();
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left flex items-center gap-2"
                      >
                        <MdEdit /> Edit
                      </button>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left flex items-center gap-2 text-red-500"
                      >
                        <MdDelete /> Delete
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="relative max-w-[70%]">
                {/* Reply Indicator */}
                {message.replyTo && (
                  <div className="text-xs text-gray-400 mb-1 ml-12">
                    Replying to: {message.replyTo.sender}
                  </div>
                )}

                <div
                  className={`relative ${
                    message.sender === currentUser
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-white dark:bg-gray-800 dark:text-white"
                  } p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {message.sender?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold">{message.sender}</p>
                        <p className="text-xs opacity-75">
                          {timeAgo(message.timeStamp)}
                        </p>
                        {message.edited && (
                          <span className="text-xs opacity-75">(edited)</span>
                        )}
                        {message.sender === currentUser && (
                          <span className="text-xs opacity-75">✓✓</span>
                        )}
                      </div>
                      {renderMessageContent(message)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {typingUsers.join(", ")}{" "}
                    {typingUsers.length === 1 ? "is" : "are"} typing...
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Input Container */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4">
          {replyTo && (
            <div className="max-w-4xl mx-auto mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center">
              <div className="text-sm">
                <span className="font-semibold">
                  Replying to {replyTo.sender}:
                </span>
                <p className="text-gray-600 dark:text-gray-300 truncate">
                  {replyTo.content}
                </p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-red-500">
                ✕
              </button>
            </div>
          )}

          {editingMessage && (
            <div className="max-w-4xl mx-auto mb-2 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex justify-between items-center">
              <div className="text-sm">
                <span className="font-semibold">Editing message:</span>
                <p className="text-gray-600 dark:text-gray-300 truncate">
                  {editingMessage.content}
                </p>
              </div>
              <button
                onClick={() => setEditingMessage(null)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          )}

          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <MdEmojiEmotions size={24} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              disabled={uploading}
            >
              <MdAttachFile size={24} />
            </button>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  editingMessage ? editMessage() : sendMessage();
                }
              }}
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              onClick={editingMessage ? editMessage : sendMessage}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-full transition transform hover:scale-105"
            >
              <MdSend size={24} />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 right-4">
              <EmojiPicker
                onEmojiClick={(emoji) => {
                  setInput((prev) => prev + emoji.emoji);
                  setShowEmojiPicker(false);
                  inputRef.current?.focus();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
