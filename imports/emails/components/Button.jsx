import React from "react";

const buttonStyle = {
  button: {
    boxSizing: "border-box",
    display: "block",
    border: "0",
    background: "#f5911e",
    padding: "0.75rem 1.5rem",
    borderRadius: "7px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    letterSpacing: "0.03rem",
    margin: "0",
    textDecoration: "none",
    outline: "none",
    textDecoration: "none",
    border: "none",
    display: "block",
    textAlign: "center"
  }
};

function Button({ children, href, className, style = {} }) {
  return (
    <a
      href={href}
      style={{ ...buttonStyle.button, ...style }}
      className={className}
      rel="external"
      target="_blank"
    >
      {children}
    </a>
  );
}

export default Button;
