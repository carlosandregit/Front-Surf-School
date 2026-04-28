import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./app/router";
import "./index.css";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 1200,
          removeDelay: 150,
          style: {
            borderRadius: "12px",
            background: "#0f172a",
            color: "#fff",
            fontSize: "14px",
            padding: "12px 16px",
          },
          success: {
            duration: 1000,
            removeDelay: 150,
          },
          error: {
            duration: 1000,
            removeDelay: 150,
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);