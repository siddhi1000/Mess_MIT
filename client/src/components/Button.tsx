import type { ButtonHTMLAttributes } from "react";
import { colors } from "../theme";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: "none",
        backgroundColor: colors.primary,
        color: "#ffffff",
        fontWeight: 500,
        fontSize: 14,
        cursor: "pointer",
        transition: "background-color 150ms ease, transform 150ms ease",
      }}
    />
  );
}
