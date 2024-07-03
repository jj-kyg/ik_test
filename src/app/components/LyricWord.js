"use client";
import React, { useEffect, useRef } from "react";

export default function LyricWord({ index, word, currentWord, setNewWord }) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (index !== currentWord || elementRef.current === null) return;
    // Scroll the highlighted word into view
    elementRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentWord, index]);

  // Override the value for the current word when clicked
  const onClick = () => {
    setNewWord(index);
  };

  let highlightStyle = {};

  const distanceToCurrent = Math.abs(index - currentWord);

  if (index === currentWord) {
    highlightStyle = {
      padding: "0.5rem",
      borderRadius: "0.75rem",
      borderWidth: "2px",
      fontWeight: 700,
      color: "#5B21B6",
    };
  } else if (distanceToCurrent === 1) {
    highlightStyle = { color: "#A78BFA" };
  } else {
    highlightStyle = { color: "#374151" };
  }

  return (
    <span
      ref={elementRef}
      style={{
        ...highlightStyle,
        cursor: "pointer",
        display: "inline-block",
        transform: "translateY(5rem)",
      }}
      onClick={onClick}
      title="Skip here"
    >
      {word}
    </span>
  );
}
