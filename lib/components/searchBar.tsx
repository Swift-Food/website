import React from "react";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "Search...",
}: SearchBarProps) {
  return <input type="text" placeholder={placeholder} style={styles.input} />;
}

const styles = {
  input: {
    width: "100%",
    padding: "0.50rem 1rem",
    borderRadius: "25px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    color: "var(--color-primary, #2563eb)", // fallback to a blue if --color-primary not set
    fontSize: "1rem",
    outline: "none",
  },
};
