import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { getUsernameFromToken, clearToken } from 'entities/user';
import { AuthPage, DashboardPage, NoteDetailPage, NoteUploadPage, ProfilePage } from 'pages';
import { LayoutView } from 'widgets';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedLayout = () => (
  <ProtectedRoute>
    <LayoutView
      username={getUsernameFromToken()}
      onLogout={() => {
        clearToken();
        window.location.href = '/login';
      }}
    >
      <Outlet />
    </LayoutView>
  </ProtectedRoute>
);

export const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/upload" element={<NoteUploadPage />} />
      <Route path="/notes/:noteId" element={<NoteDetailPage />} />
    </Route>
  </Routes>
);
