// client/src/components/TerminalBootText.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Terminal = styled.pre`
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9rem;
  color: #00ff00;
  background-color: transparent;
  white-space: pre-wrap;
  line-height: 1.4;
  max-height: 300px;
  overflow-y: auto;
`;

const bootLines = [
  "> boot sequence initialized",
  "> verifying biometric patterns...",
  "> connection established: 127.0.0.1",
  "> loading underground modules...",
  "> decrypting source stream...",
  "> establishing journalist uplink...",
  "> status: ⚠ unauthorized access",
  "> prompt for site passphrase...",
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
        }, 60); // slower typing
        return () => clearTimeout(timeout);
      } else {
        setOutput((prev) => prev + "\n");
        setLineIndex((prev) => prev + 1);
        setCharIndex(0);
      }
    }
  }, [lineIndex, charIndex]);

  return <Terminal>{output}</Terminal>;
};

export default TerminalBootText;
