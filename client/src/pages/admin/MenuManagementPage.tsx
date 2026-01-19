import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { colors } from "../../theme";
import { apiRequest } from "../../api";

type Menu = {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
};

export function MenuManagementPage() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Menu | null>(`/admin/menus?date=${date}`)
      .then((m) => {
        if (m) {
          setBreakfast(m.breakfast);
          setLunch(m.lunch);
          setDinner(m.dinner);
        } else {
          setBreakfast("");
          setLunch("");
          setDinner("");
        }
      })
      .catch(() => {});
  }, [date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    await apiRequest("/admin/menus", {
      method: "POST",
      body: JSON.stringify({ date, breakfast, lunch, dinner }),
    });
    setMessage("Menu saved");
  }

  return (
    <Layout>
      <Card title="Daily Menu">
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}
        >
          <div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Date</div>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Breakfast</div>
            <Input value={breakfast} onChange={(e) => setBreakfast(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Lunch</div>
            <Input value={lunch} onChange={(e) => setLunch(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Dinner</div>
            <Input value={dinner} onChange={(e) => setDinner(e.target.value)} />
          </div>
          {message && (
            <div style={{ color: colors.primary, fontSize: 13 }}>
              {message}
            </div>
          )}
          <Button type="submit">Save menu</Button>
        </form>
      </Card>
    </Layout>
  );
}
