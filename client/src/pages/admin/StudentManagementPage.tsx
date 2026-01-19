import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type Student = {
  id: number;
  name: string;
  email: string;
  roll_number: string;
  room_number: string;
  active: number;
};

export function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  async function loadStudents() {
    const data = await apiRequest<Student[]>(`/admin/students?search=${encodeURIComponent(search)}`);
    setStudents(data);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await apiRequest("/admin/students", {
      method: "POST",
      body: JSON.stringify({ name, email, rollNumber, roomNumber, active: true }),
    });
    setName("");
    setEmail("");
    setRollNumber("");
    setRoomNumber("");
    await loadStudents();
  }

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Add student">
          <form
            onSubmit={handleCreate}
            style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}
          >
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              placeholder="Roll number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
            <Input
              placeholder="Room number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
            <div style={{ gridColumn: "span 4 / span 4" }}>
              <Button type="submit">Add student</Button>
            </div>
          </form>
        </Card>
        <Card title="Students">
          <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            <Input
              placeholder="Search by name or roll number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="button" onClick={loadStudents}>
              Search
            </Button>
          </div>
          {students.length === 0 ? (
            <div style={{ color: colors.muted, fontSize: 14 }}>No students</div>
          ) : (
            <Table headers={["Name", "Roll", "Room", "Email", "Status"]}>
              {students.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: "8px 10px" }}>{s.name}</td>
                  <td style={{ padding: "8px 10px" }}>{s.roll_number}</td>
                  <td style={{ padding: "8px 10px" }}>{s.room_number}</td>
                  <td style={{ padding: "8px 10px" }}>{s.email}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        backgroundColor: s.active ? "#dcfce7" : "#fee2e2",
                        color: s.active ? colors.primary : colors.danger,
                        fontSize: 12,
                      }}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </span>
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
