import React from "react";
import {
  Navigate,
  Outlet,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { isAdminAuthenticated } from "../services/adminAuth";

export default function AdminGuard() {
  const { slug } = useParams();
  const contextoPai = useOutletContext();

  if (!isAdminAuthenticated()) {
    return <Navigate to={`/${slug}/admin/login`} replace />;
  }

  return <Outlet context={contextoPai} />;
}