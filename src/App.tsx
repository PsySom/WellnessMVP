import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PageLoader } from "@/components/common/PageLoader";

// Auth pages (eager load)
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// App pages (lazy load)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TrackerHistory = lazy(() => import("./pages/TrackerHistory"));
const ActivityTemplates = lazy(() => import("./pages/ActivityTemplates"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Journal = lazy(() => import("./pages/Journal"));
const JournalHistory = lazy(() => import("./pages/JournalHistory"));
const Tests = lazy(() => import("./pages/Tests"));
const TestDetail = lazy(() => import("./pages/TestDetail"));
const TakeTest = lazy(() => import("./pages/TakeTest"));
const TestResult = lazy(() => import("./pages/TestResult"));
const Exercises = lazy(() => import("./pages/Exercises"));
const ExerciseDetail = lazy(() => import("./pages/ExerciseDetail"));
const ExerciseSession = lazy(() => import("./pages/ExerciseSession"));
const ExercisesTests = lazy(() => import("./pages/ExercisesTests"));
const Insights = lazy(() => import("./pages/Insights"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Suspense fallback={<PageLoader variant="dashboard" />}>
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
                path="/exercises-tests"
                element={
                  <ProtectedRoute>
                    <ExercisesTests />
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
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Recommendations />
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
          </Suspense>
        </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
