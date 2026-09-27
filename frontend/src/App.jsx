import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import CreateEditPostPage from './pages/CreateEditPostPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Reader Feed & Article Route */}
              <Route path="/" element={<HomePage />} />
              <Route path="/post/:slugOrId" element={<PostDetailPage />} />
              <Route path="/user/:username" element={<ProfilePage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Author Routes */}
              <Route
                path="/write"
                element={
                  <ProtectedRoute>
                    <CreateEditPostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <CreateEditPostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 — Page Not Found</h2>
                    <a href="/" className="btn btn-primary">Return to MindNest Homepage</a>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
