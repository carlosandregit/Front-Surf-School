import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Schedule from "../pages/Schedule";
import MyBookings from "../pages/MyBookings";
import Admin from "../pages/Admin";
import AdminLogin from "../pages/AdminLogin";
import AdminGuard from "../components/AdminGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Schedule /> },
      { path: "meus-agendamentos", element: <MyBookings /> },

      // login do admin
      { path: "admin/login", element: <AdminLogin /> },

      // área admin protegida
      {
        element: <AdminGuard />,
        children: [{ path: "admin", element: <Admin /> }],
      },
    ],
  },
]);