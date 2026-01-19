import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { MenuManagementPage } from "./pages/admin/MenuManagementPage";
import { StudentManagementPage } from "./pages/admin/StudentManagementPage";
import { AttendancePage } from "./pages/admin/AttendancePage";
import { BillingPage } from "./pages/admin/BillingPage";
import { FeedbackPage } from "./pages/admin/FeedbackPage";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentAttendancePage } from "./pages/student/StudentAttendancePage";
import { StudentBillingPage } from "./pages/student/StudentBillingPage";
import { StudentFeedbackPage } from "./pages/student/StudentFeedbackPage";
import { SuperAdminDashboard } from "./pages/superAdmin/SuperAdminDashboard";
import { AdminManagementPage } from "./pages/superAdmin/AdminManagementPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/menus" element={<MenuManagementPage />} />
            <Route path="/admin/students" element={<StudentManagementPage />} />
            <Route path="/admin/attendance" element={<AttendancePage />} />
            <Route path="/admin/billing" element={<BillingPage />} />
            <Route path="/admin/feedback" element={<FeedbackPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/billing" element={<StudentBillingPage />} />
            <Route path="/student/feedback" element={<StudentFeedbackPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/admins" element={<AdminManagementPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
