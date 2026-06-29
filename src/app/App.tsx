import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./lib/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import StatusPage from "./pages/StatusPage";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import CVBuilderPage from "./pages/CVBuilderPage";
import CoverLettersPage from "./pages/CoverLettersPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import CareerAdvisorPage from "./pages/CareerAdvisorPage";
import TemplatesPage from "./pages/TemplatesPage";
import TemplatePreviewPage from "./pages/TemplatePreviewPage";
import DownloadsPage from "./pages/DownloadsPage";
import SettingsPage from "./pages/SettingsPage";




function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-[#0F172A]"><div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      // Dark mode is the primary/default theme.
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return true;
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/about" element={<AboutPage darkMode={darkMode} />} />
          <Route path="/privacy" element={<PrivacyPage darkMode={darkMode} />} />
          <Route path="/terms" element={<TermsPage darkMode={darkMode} />} />
          <Route path="/contact" element={<ContactPage darkMode={darkMode} />} />
          <Route path="/status" element={<StatusPage darkMode={darkMode} />} />

          <Route path="/login" element={<AuthPage type="login" darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/signup" element={<AuthPage type="signup" darkMode={darkMode} setDarkMode={setDarkMode} />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="cv" element={<CVBuilderPage />} />
            <Route path="letters" element={<CoverLettersPage />} />
            <Route path="interview" element={<InterviewPrepPage />} />
            <Route path="advisor" element={<CareerAdvisorPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="template-preview" element={<TemplatePreviewPage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Backward-compatible standalone routes (same UI) */}
          <Route path="/cv-builder" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }>
            <Route index element={<CVBuilderPage />} />
          </Route>

          <Route path="/cover-letters" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }>
            <Route index element={<CoverLettersPage />} />
          </Route>

          <Route path="/interview-prep" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }>
            <Route index element={<InterviewPrepPage />} />
          </Route>

          <Route path="/career-advisor" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }>
            <Route index element={<CareerAdvisorPage />} />
          </Route>

          <Route path="/templates" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }>
            <Route index element={<TemplatesPage />} />
          </Route>

          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }>
            <Route index element={<SettingsPage />} />
          </Route>



          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
