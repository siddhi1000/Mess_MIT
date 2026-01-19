import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type AdminRow = {
  id: number;
  username: string;
  role: string;
};

export function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function load() {
    const data = await apiRequest<AdminRow[]>("/super-admin/admins");
    setAdmins(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await apiRequest("/super-admin/admins", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUsername("");
    setPassword("");
    await load();
  }

  async function handleDelete(id: number) {
    await apiRequest(`/super-admin/admins/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Create admin">
          <form
            onSubmit={handleCreate}
            style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}
          >
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ gridColumn: "span 2 / span 2" }}>
              <Button type="submit">Create admin</Button>
            </div>
          </form>
        </Card>
        <Card title="Admins">
          {admins.length === 0 ? (
            <div style={{ color: colors.muted, fontSize: 14 }}>No admins created yet</div>
          ) : (
            <Table headers={["Username", "Role", ""]}>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td style={{ padding: "8px 10px" }}>{a.username}</td>
                  <td style={{ padding: "8px 10px" }}>{a.role}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <button
                      onClick={() => handleDelete(a.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "none",
                        backgroundColor: colors.danger,
                        color: "#ffffff",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </Layout>
  );
}
