import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { colors } from "../theme";
import { useAuth } from "../auth/AuthContext";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.background }}>
      <aside
        style={{
          width: 260,
          backgroundColor: colors.background,
          color: "#ffffff",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 600 }}>Mess Manager</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {user?.role === "SUPER_ADMIN" && (
            <>
              <NavLink to="/super-admin/dashboard" label="Dashboard" />
              <NavLink to="/super-admin/admins" label="Admins" />
            </>
          )}
          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/admin/dashboard" label="Dashboard" />
              <NavLink to="/admin/menus" label="Menus" />
              <NavLink to="/admin/students" label="Students" />
              <NavLink to="/admin/attendance" label="Attendance" />
              <NavLink to="/admin/billing" label="Billing" />
              <NavLink to="/admin/feedback" label="Feedback" />
            </>
          )}
          {user?.role === "STUDENT" && (
            <>
              <NavLink to="/student/dashboard" label="Dashboard" />
              <NavLink to="/student/attendance" label="Attendance" />
              <NavLink to="/student/billing" label="Billing" />
              <NavLink to="/student/feedback" label="Feedback" />
            </>
          )}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              backgroundColor: colors.danger,
              color: "#ffffff",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background-color 150ms ease",
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {children}
      </main>
    </div>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      style={{
        padding: "8px 10px",
        borderRadius: 6,
        color: "#e5e7eb",
        textDecoration: "none",
        fontSize: 14,
      }}
    >
      {label}
    </Link>
  );
}
