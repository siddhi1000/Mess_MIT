import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type DashboardData = {
  todayMenu: {
    breakfast: string;
    lunch: string;
    dinner: string;
  } | null;
  todayAttendance: {
    id: number;
    present: number;
  } | null;
  latestBill: {
    month: string;
    amount: number;
    status: "PAID" | "UNPAID";
  } | null;
};

export function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiRequest<DashboardData>("/student/dashboard")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 }}>
          <Card title="Today’s menu">
            {data?.todayMenu ? (
              <div style={{ fontSize: 14, color: colors.text }}>
                <div>Breakfast: {data.todayMenu.breakfast}</div>
                <div>Lunch: {data.todayMenu.lunch}</div>
                <div>Dinner: {data.todayMenu.dinner}</div>
              </div>
            ) : (
              <div style={{ color: colors.muted, fontSize: 14 }}>No menu for today</div>
            )}
          </Card>
          <Card title="Today’s attendance">
            {data?.todayAttendance ? (
              <div style={{ fontSize: 14 }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    backgroundColor: "#dcfce7",
                    color: colors.primary,
                    fontSize: 12,
                  }}
                >
                  Present
                </span>
              </div>
            ) : (
              <div style={{ color: colors.muted, fontSize: 14 }}>Not marked yet</div>
            )}
          </Card>
          <Card title="Latest bill">
            {data?.latestBill ? (
              <div style={{ fontSize: 14, color: colors.text }}>
                <div>Month: {data.latestBill.month}</div>
                <div>Amount: ₹{data.latestBill.amount}</div>
                <div>
                  Status:{" "}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      backgroundColor:
                        data.latestBill.status === "PAID" ? "#dcfce7" : "#fee2e2",
                      color: data.latestBill.status === "PAID" ? colors.primary : colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {data.latestBill.status === "PAID" ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: colors.muted, fontSize: 14 }}>No billing data</div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

