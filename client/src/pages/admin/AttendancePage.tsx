import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Input } from "../../components/Input";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type Row = {
  id: number;
  name: string;
  roll_number: string;
  date: string;
  present: number;
};

export function AttendancePage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const data = await apiRequest<Row[]>(`/admin/attendance?date=${date}`);
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout>
      <Card title="Attendance">
        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button
            onClick={load}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            Load
          </button>
        </div>
        {rows.length === 0 ? (
          <div style={{ color: colors.muted, fontSize: 14 }}>No attendance records</div>
        ) : (
          <Table headers={["Roll", "Name", "Present"]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: "8px 10px" }}>{r.roll_number}</td>
                <td style={{ padding: "8px 10px" }}>{r.name}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      backgroundColor: r.present ? "#dcfce7" : "#fee2e2",
                      color: r.present ? colors.primary : colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {r.present ? "Present" : "Absent"}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </Layout>
  );
}

