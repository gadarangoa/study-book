import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AppLayout } from "@/layouts/app-layout"
import { AuthProvider, ProtectedRoute } from "@/features/auth"
import { DashboardPage } from "@/pages/dashboard"
import { LoginPage } from "@/pages/login"
import { CareerDetailPage } from "@/pages/career-detail"
import { CourseDetailPage } from "@/pages/course-detail"
import { TeamPage } from "@/pages/team"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/careers/:careerId" element={<CareerDetailPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/team" element={<TeamPage />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
