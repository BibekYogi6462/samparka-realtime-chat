import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router-dom";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });
  const [activeTab, setActiveTab] = useState("join");

  const {
    setRoomId,
    setCurrentUser,
    setConnected,
    roomId,
    currentUser,
    connected,
  } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected && roomId && currentUser) {
      navigate("/chat");
    }
  }, [roomId, currentUser, connected, navigate]);

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId.trim() === "" || detail.userName.trim() === "") {
      toast.error("Please enter both Room ID and Username");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        const joinedRoomId = room.roomId || detail.roomId;
        toast.success(`Joined room ${joinedRoomId} successfully!`);
        setCurrentUser(detail.userName);
        setRoomId(joinedRoomId);
        setConnected(true);
      } catch (error) {
        toast.error(error.response?.data || "Error joining room");
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const roomDetail = { roomId: detail.roomId };
        const response = await createRoomApi(roomDetail);
        const createdRoomId = response.roomId || detail.roomId;
        toast.success(`Room ${createdRoomId} created successfully!`);
        setCurrentUser(detail.userName);
        setRoomId(createdRoomId);
        setConnected(true);
      } catch (error) {
        toast.error(error.response?.data || "Error creating room");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Brand Section */}
            <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">ChatVerse</h2>
                  <p className="text-sm text-white/80">Real-time Chat</p>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">
                  Connect Instantly
                </h1>
                <p className="text-lg text-white/90">
                  Join or create chat rooms and start messaging in real-time.
                </p>

                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-white">✓</span>
                    </div>
                    <span className="text-white">Real-time messaging</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-white">✓</span>
                    </div>
                    <span className="text-white">Private & secure rooms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-white">✓</span>
                    </div>
                    <span className="text-white">No registration required</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="md:w-1/2 p-8 bg-white">
              {/* Tab Switcher */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("join")}
                  className={`flex-1 py-2 rounded-md font-medium transition ${
                    activeTab === "join"
                      ? "bg-purple-500 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Join Room
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className={`flex-1 py-2 rounded-md font-medium transition ${
                    activeTab === "create"
                      ? "bg-purple-500 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Create Room
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    onChange={handleFormInputChange}
                    value={detail.userName}
                    type="text"
                    name="userName"
                    placeholder="Enter your username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Room ID Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room ID
                  </label>
                  <input
                    name="roomId"
                    onChange={handleFormInputChange}
                    value={detail.roomId}
                    type="text"
                    placeholder={
                      activeTab === "join"
                        ? "Enter room ID to join"
                        : "Enter new room ID"
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Action Button */}
                <button
                  onClick={activeTab === "join" ? joinChat : createRoom}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded-lg transition mt-4"
                >
                  {activeTab === "join" ? "Join Room" : "Create Room"}
                </button>

                {/* Info Text */}
                <p className="text-center text-xs text-gray-500 mt-4">
                  {activeTab === "join"
                    ? "Enter a room ID to join an existing conversation"
                    : "Create your own room and share the ID with friends"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
