import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// App pages
import Dashboard from "./pages/Dashboard";
import TrackerHistory from "./pages/TrackerHistory";
import ActivityTemplates from "./pages/ActivityTemplates";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import JournalHistory from "./pages/JournalHistory";
import Tests from "./pages/Tests";
import TestDetail from "./pages/TestDetail";
import TakeTest from "./pages/TakeTest";
import TestResult from "./pages/TestResult";
import Exercises from "./pages/Exercises";
import ExerciseDetail from "./pages/ExerciseDetail";
import ExerciseSession from "./pages/ExerciseSession";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracker-history"
              element={
                <ProtectedRoute>
                  <TrackerHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity-templates"
              element={
                <ProtectedRoute>
                  <ActivityTemplates />
                </ProtectedRoute>
              }
            />
            <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/history"
            element={
              <ProtectedRoute>
                <JournalHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <ProtectedRoute>
                <Tests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:slug"
            element={
              <ProtectedRoute>
                <TestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:slug/take"
            element={
              <ProtectedRoute>
                <TakeTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:slug/results/:resultId"
            element={
              <ProtectedRoute>
                <TestResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <Exercises />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises/:slug"
            element={
              <ProtectedRoute>
                <ExerciseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises/:slug/session"
            element={
              <ProtectedRoute>
                <ExerciseSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
