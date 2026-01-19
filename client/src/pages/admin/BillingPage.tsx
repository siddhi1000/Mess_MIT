import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Input } from "../../components/Input";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type Bill = {
  id: number;
  student_id: number;
  name: string;
  roll_number: string;
  month: string;
  amount: number;
  status: "PAID" | "UNPAID";
};

export function BillingPage() {
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [rows, setRows] = useState<Bill[]>([]);

  async function load() {
    const data = await apiRequest<Bill[]>(`/admin/billing?month=${month}`);
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(bill: Bill) {
    const next = bill.status === "PAID" ? "UNPAID" : "PAID";
    await apiRequest(`/admin/billing/${bill.id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: next }),
    });
    await load();
  }

  function handleMonthChange(e: FormEvent<HTMLInputElement>) {
    setMonth(e.currentTarget.value);
  }

  return (
    <Layout>
      <Card title="Billing">
        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          <Input type="month" value={month} onChange={handleMonthChange} />
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
          <div style={{ color: colors.muted, fontSize: 14 }}>No billing records</div>
        ) : (
          <Table headers={["Roll", "Name", "Month", "Amount", "Status", ""]}>
            {rows.map((b) => (
              <tr key={b.id}>
                <td style={{ padding: "8px 10px" }}>{b.roll_number}</td>
                <td style={{ padding: "8px 10px" }}>{b.name}</td>
                <td style={{ padding: "8px 10px" }}>{b.month}</td>
                <td style={{ padding: "8px 10px" }}>₹{b.amount}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      backgroundColor: b.status === "PAID" ? "#dcfce7" : "#fee2e2",
                      color: b.status === "PAID" ? colors.primary : colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {b.status === "PAID" ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <button
                    onClick={() => toggleStatus(b)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "none",
                      backgroundColor: colors.primary,
                      color: "#ffffff",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </Layout>
  );
}
