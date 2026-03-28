import React from "react";
import { Routes, Route } from "react-router-dom";
import JoinCreateChat from "../components/JoinCreateChat";
import ChatPage from "../components/Chatpage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<JoinCreateChat />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route
        path="*"
        element={
          <h1 className="text-center text-2xl mt-20">404 Page Not Found</h1>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
