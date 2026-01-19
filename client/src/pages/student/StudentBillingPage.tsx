import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type Bill = {
  month: string;
  amount: number;
  status: "PAID" | "UNPAID";
};

export function StudentBillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    apiRequest<Bill[]>("/student/billing")
      .then(setBills)
      .catch(() => setBills([]));
  }, []);

  return (
    <Layout>
      <Card title="Monthly bills">
        {bills.length === 0 ? (
          <div style={{ color: colors.muted, fontSize: 14 }}>No billing records</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            {bills.map((b) => (
              <div
                key={b.month}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span>{b.month}</span>
                <span>₹{b.amount}</span>
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
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}

