import type { InputHTMLAttributes } from "react";
import { colors } from "../theme";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        fontSize: 14,
        outline: "none",
      }}
    />
  );
}
