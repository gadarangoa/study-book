import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AppLayout } from "@/layouts/app-layout"
import { AuthProvider, ProtectedRoute } from "@/features/auth"
import { DashboardPage } from "@/pages/dashboard"
import { LoginPage } from "@/pages/login"
import { CareerDetailPage } from "@/pages/career-detail"
import { CourseDetailPage } from "@/pages/course-detail"
import { CourseResourcesPage } from "@/pages/course-resources"
import { DocumentEditorPage } from "@/pages/document-editor"
import { DocumentsPage } from "@/pages/documents"
import { TeamPage } from "@/pages/team"
import { InviteAcceptPage } from "@/pages/invite-accept"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/invite/:token" element={<InviteAcceptPage />} />
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
            <Route path="/courses/:courseId/resources" element={<CourseResourcesPage />} />
            <Route path="/courses/:courseId/documents" element={<DocumentsPage />} />
            <Route
              path="/courses/:courseId/documents/:documentId"
              element={<DocumentEditorPage />}
            />
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
