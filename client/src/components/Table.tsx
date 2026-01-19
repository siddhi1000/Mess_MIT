import type { ReactNode } from "react";
import { colors } from "../theme";

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${colors.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead style={{ backgroundColor: "#f3f4f6" }}>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderBottom: `1px solid ${colors.border}`,
                  fontWeight: 500,
                  color: colors.muted,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
