import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type HistoryRow = {
  date: string;
  present: number;
};

export function StudentAttendancePage() {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load attendance history
  async function loadHistory() {
    try {
      const data = await apiRequest<HistoryRow[]>("/student/attendance-history");
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // Mark attendance
  async function markAttendance() {
    setMessage(null);
    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>("/attendance/mark", {
        method: "POST",
      });

      // Display backend message
      setMessage(response.message || "Attendance marked");
      await loadHistory();
    } catch (err) {
      // If backend returns JSON with message
      if (err instanceof Response) {
        try {
          const data = await err.json();
          setMessage(data.message || "Something went wrong");
        } catch {
          setMessage("Something went wrong");
        }
      } else {
        setMessage((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* QR Attendance Card */}
        <Card title="QR Attendance">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, color: colors.muted }}>
              Use this section after scanning your QR code at the mess.
            </div>

            <Button type="button" onClick={markAttendance} disabled={loading}>
              {loading ? "Marking..." : "Mark attendance for today"}
            </Button>

            {message && (
              <div
                style={{
                  fontSize: 13,
                  color: message.toLowerCase().includes("already") ? colors.muted : colors.primary,
                }}
              >
                {message}
              </div>
            )}
          </div>
        </Card>

        {/* Attendance History Card */}
        <Card title="Attendance history">
          {history.length === 0 ? (
            <div style={{ color: colors.muted, fontSize: 14 }}>No records yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
              {history.map((h) => (
                <div
                  key={h.date}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span>{h.date}</span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      backgroundColor: h.present ? "#dcfce7" : "#fee2e2",
                      color: h.present ? colors.primary : colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {h.present ? "Present" : "Absent"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
