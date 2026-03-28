// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import { BrowserRouter } from "react-router";
// import AppRoutes from "./config/routes.jsx";
// import { Toaster } from "react-hot-toast";
// import { ChatProvider } from "./context/ChatContext.jsx";

// createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <Toaster position="top-center" />
//     <ChatProvider>
//       <AppRoutes />
//     </ChatProvider>
//   </BrowserRouter>,
// );
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext.jsx";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </ChatProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
