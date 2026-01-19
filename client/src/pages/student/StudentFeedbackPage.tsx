import type { FormEvent } from "react";
import { useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { colors } from "../../theme";
import { Button } from "../../components/Button";
import { apiRequest } from "../../api";

export function StudentFeedbackPage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    await apiRequest("/student/feedback", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    setMessage("");
    setStatus("Feedback submitted");
  }

  return (
    <Layout>
      <Card title="Submit feedback">
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your feedback about food, hygiene, or suggestions"
            style={{
              minHeight: 120,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: 10,
              fontSize: 14,
              resize: "vertical",
            }}
          />
          {status && (
            <div style={{ fontSize: 13, color: colors.primary }}>
              {status}
            </div>
          )}
          <Button type="submit" disabled={!message.trim()}>
            Submit
          </Button>
        </form>
      </Card>
    </Layout>
  );
}
