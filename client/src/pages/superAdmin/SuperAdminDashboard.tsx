import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { colors } from "../../theme";

export function SuperAdminDashboard() {
  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: colors.text }}>Super Admin</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 }}>
          <Card title="Admins">
            <div style={{ fontSize: 14, color: colors.muted }}>
              Manage admin accounts for different hostels or buildings.
            </div>
          </Card>
          <Card title="System configuration">
            <div style={{ fontSize: 14, color: colors.muted }}>
              Configure base fee and global mess settings.
            </div>
          </Card>
          <Card title="Overview">
            <div style={{ fontSize: 14, color: colors.muted }}>
              High-level summaries can be added here.
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

