import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Button } from "../../components/Button";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

export function FeedbackPage() {
  const [rows, setRows] = useState<
    Array<{
      id: number;
      name: string;
      roll_number: string;
      message: string;
      status: "NEW" | "REVIEWED";
      created_at?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const data = await apiRequest<typeof rows>("/admin/feedback");
      setRows(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: number, status: "NEW" | "REVIEWED") {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/admin/feedback/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Card title="Student Feedback">
        {error && (
          <div style={{ fontSize: 13, color: colors.danger, marginBottom: 10 }}>{error}</div>
        )}
        {rows.length === 0 ? (
          <div style={{ color: colors.muted, fontSize: 14 }}>No feedback yet</div>
        ) : (
          <Table headers={["Student", "Roll No.", "Message", "Status", "Created", ""]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: "8px 10px" }}>{r.name}</td>
                <td style={{ padding: "8px 10px" }}>{r.roll_number}</td>
                <td style={{ padding: "8px 10px", maxWidth: 420, whiteSpace: "normal" }}>
                  {r.message}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      backgroundColor: r.status === "REVIEWED" ? "#dcfce7" : "#fef3c7",
                      color: r.status === "REVIEWED" ? "#166534" : "#92400e",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", color: colors.muted, fontSize: 12 }}>
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "--"}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  {r.status === "NEW" ? (
                    <Button disabled={loading} onClick={() => updateStatus(r.id, "REVIEWED")}>
                      Mark reviewed
                    </Button>
                  ) : (
                    <Button disabled={loading} onClick={() => updateStatus(r.id, "NEW")}>
                      Reset to new
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </Layout>
  );
}
