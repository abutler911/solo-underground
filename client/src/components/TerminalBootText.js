import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const blink = keyframes`
  50% {
    opacity: 0;
  }
`;

const Terminal = styled.pre`
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9rem;
  color: #00ff00;
  background-color: transparent;
  white-space: pre-wrap;
  line-height: 1.4;
  max-height: 280px;
  overflow-y: auto;
  padding-bottom: 0.5rem;

  &:after {
    content: "█";
    margin-left: 2px;
    animation: ${blink} 1s step-start infinite;
  }
`;

const bootLines = [
  "> boot sequence initialized...",
  "> verifying biometric hash...",
  "> uplink to node.404.established",
  "> loading modules [REDACTED]",
  "> decrypting intel stream...",
  "> access warning: surveillance detected",
];

const TerminalBootText = () => {
  const [output, setOutput] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex < bootLines.length) {
      const currentLine = bootLines[lineIndex];
      if (charIndex < currentLine.length) {
        const timeout = setTimeout(() => {
          setOutput((prev) => prev + currentLine[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 75); // slower, terminal-like feel
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setOutput((prev) => prev + "\n");
          setLineIndex((prev) => prev + 1);
          setCharIndex(0);
        }, 300); // slight delay between lines
        return () => clearTimeout(timeout);
      }
    }
  }, [lineIndex, charIndex]);

  return <Terminal>{output}</Terminal>;
};

export default TerminalBootText;
