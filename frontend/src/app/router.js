import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <LayoutView
      username={getUsernameFromToken()}
      onLogout={() => {
        clearToken();
        window.location.href = '/login';
      }}
    >
      {children}
    </LayoutView>
  </ProtectedRoute>
);

export const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
    <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
    <Route path="/upload" element={<ProtectedLayout><NoteUploadPage /></ProtectedLayout>} />
    <Route path="/notes/:noteId" element={<ProtectedLayout><NoteDetailPage /></ProtectedLayout>} />
  </Routes>
);
