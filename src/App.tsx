/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { Quizzes } from "./components/Quizzes";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";

import { ThemeProvider } from "next-themes";

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              
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
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
