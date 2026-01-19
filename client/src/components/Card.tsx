import type { ReactNode } from "react";
import { colors } from "../theme";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
      }}
    >
      {title && (
        <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 16, color: colors.text }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
