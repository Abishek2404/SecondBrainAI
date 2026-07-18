/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useOutlet } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { Documents } from "./components/Documents";
import { SmartNotes } from "./components/SmartNotes";
import { StudyPlanner } from "./components/StudyPlanner";
import { Flashcards } from "./components/Flashcards";
import { Analytics } from "./components/Analytics";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { StreakProvider } from "./components/StreakProvider";
import { Quizzes } from "./components/Quizzes";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AnimatePresence, motion } from "motion/react";

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

function AuthLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {currentOutlet}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <StreakProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                  </Route>
                  
                  <Route path="/" element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route index element={<Dashboard />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="notes" element={<SmartNotes />} />
                    <Route path="quizzes" element={<Quizzes />} />
                    <Route path="planner" element={<StudyPlanner />} />
                    <Route path="flashcards" element={<Flashcards />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </StreakProvider>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
