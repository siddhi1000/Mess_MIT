import { useEffect, useState } from "react";
import { apiRequest } from "../../api";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { colors } from "../../theme";

type Summary = {
  totalStudents: number;
  totalAttendanceToday: number;
  totalUnpaid: number;
};

export function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    apiRequest<Summary>("/admin/dashboard-summary")
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: colors.text }}>Admin Dashboard</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
          <Card title="Students">
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {summary ? summary.totalStudents : "--"}
            </div>
          </Card>
          <Card title="Attendance Today">
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {summary ? summary.totalAttendanceToday : "--"}
            </div>
          </Card>
          <Card title="Unpaid Bills">
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {summary ? summary.totalUnpaid : "--"}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

