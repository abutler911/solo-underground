import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Terminal = styled.pre`
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9rem;
  color: #00ff00;
  background-color: transparent;
  white-space: pre-wrap;
  line-height: 1.4;
  max-height: 280px;
  overflow-y: auto;
`;

const Line = styled.div`
  display: flex;
  align-items: center;
`;

const Cursor = styled.span`
  display: inline-block;
  animation: blink 1s step-start infinite;
  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
`;

const bootLines = [
  "> [SYS] Initiating zero-trace protocol...",
  "> [ALERT] Firewall evasion matrix engaged...",
  "> [NODE] Routing through onion relays...",
  "> [AUTH] Access granted: ***REDACTED***.enc",
];

const TerminalBootText = () => {
  const [lines, setLines] = useState([]);
  const [charIndex, setCharIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (lineIndex < bootLines.length) {
      const currentLine = bootLines[lineIndex];
      if (charIndex < currentLine.length) {
        const timeout = setTimeout(() => {
          const updatedLine = (lines[lineIndex] || "") + currentLine[charIndex];
          setLines((prev) => [...prev.slice(0, lineIndex), updatedLine]);
          setCharIndex((prev) => prev + 1);
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        setLineIndex((prev) => prev + 1);
        setCharIndex(0);
      }
    } else {
      setIsComplete(true);
    }
  }, [charIndex, lineIndex, lines]);

  return (
    <Terminal>
      {bootLines.map((_, idx) => {
        const isTyping = idx === lineIndex && lineIndex < bootLines.length;
        const lineText = lines[idx] || "";
        return (
          <div key={idx}>
            {lineText}
            {isTyping && <Cursor>█</Cursor>}
            {idx === bootLines.length - 1 && isComplete && <Cursor>█</Cursor>}
          </div>
        );
      })}
    </Terminal>
  );
};

export default TerminalBootText;
