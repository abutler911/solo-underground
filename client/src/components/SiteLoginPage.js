// client/src/components/SiteLoginPage.js
import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import TerminalBootText from "./TerminalBootText";

// Add more apocalyptic keyframes
const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
`;

const scanlines = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`;

const flicker = keyframes`
  0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
    opacity: 0.99;
    text-shadow: 
      0 0 5px #00ff41,
      0 0 10px #00ff41,
      0 0 15px #00ff41;
  }
  20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
    opacity: 0.4;
    text-shadow: none;
  }
`;

const staticNoise = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 100px 100px; }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
      circle at 20% 80%,
      rgba(0, 255, 65, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 0, 65, 0.05) 0%,
      transparent 50%
    ),
    linear-gradient(180deg, #000a00 0%, #001100 30%, #000500 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;

  /* Static noise overlay */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 65, 0.02) 2px,
        rgba(0, 255, 65, 0.02) 4px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.1) 2px,
        rgba(0, 0, 0, 0.1) 4px
      );
    animation: ${staticNoise} 0.5s linear infinite;
    pointer-events: none;
    z-index: 1;
  }

  /* Scanlines effect */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 65, 0.8) 50%,
      transparent
    );
    animation: ${scanlines} 3s linear infinite;
    pointer-events: none;
    z-index: 2;
  }

  /* Improve mobile experience */
  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: flex-start;
    padding-top: 10vh;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    padding-top: 8vh;
  }

  /* Handle landscape orientation on mobile */
  @media (max-height: 600px) and (orientation: landscape) {
    padding: 1rem;
    justify-content: center;
    min-height: 100vh;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: radial-gradient(
      circle at center,
      rgba(0, 255, 65, 0.1) 0%,
      rgba(0, 0, 0, 0.95) 40%
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 65, 0.05) 2px,
      rgba(0, 255, 65, 0.05) 4px
    );
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(5px);

  /* Add matrix-like effect */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text y="50" font-family="monospace" font-size="12" fill="%2300ff4120">SOLO</text></svg>')
      repeat;
    animation: ${staticNoise} 2s linear infinite;
    opacity: 0.3;
  }
`;

const flash = keyframes`
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const OverlayText = styled.h2`
  font-family: "Courier New", monospace;
  color: ${(props) => (props.status === "granted" ? "#00ff41" : "#ff0040")};
  font-size: clamp(1.2rem, 5vw, 2rem);
  letter-spacing: clamp(0.5px, 0.2vw, 1px);
  animation: ${flash} 0.5s ease-in-out, ${flicker} 2s infinite;
  text-align: center;
  white-space: pre-line;
  padding: 0 1rem;
  line-height: 1.4;
  text-shadow: 0 0 5px currentColor, 0 0 10px currentColor,
    0 0 20px currentColor, 0 0 40px currentColor;
  position: relative;
  z-index: 10;

  /* Add glitch effect for denied status */
  ${(props) =>
    props.status === "denied" &&
    `
    animation: ${flash} 0.5s ease-in-out, ${glitch} 0.3s ease-in-out infinite;
  `}

  /* Add typewriter effect for granted status */
  ${(props) =>
    props.status === "granted" &&
    `
    overflow: hidden;
    border-right: 2px solid #00ff41;
    white-space: nowrap;
    animation: ${typewriter} 1.5s steps(40, end), ${flicker} 2s infinite;
  `}

  @media (max-width: 480px) {
    font-size: 1rem;
    letter-spacing: 0.5px;
    line-height: 1.3;
  }
`;

const Logo = styled.h1`
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 800;
  margin: 0;
  letter-spacing: clamp(1px, 0.3vw, 2px);
  font-family: "Courier New", monospace;
  background: linear-gradient(135deg, #00ff41 0%, #ffffff 50%, #00ff41 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41;
  text-align: center;
  line-height: 1.1;
  word-break: break-word;
  position: relative;
  animation: ${flicker} 4s infinite;

  /* Add glitch overlay effect */
  &::before {
    content: "SOLO UNDERGROUND";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #ff0040 0%,
      transparent 50%,
      #ff0040 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${glitch} 3s infinite;
    opacity: 0.1;
  }

  &::after {
    content: "SOLO UNDERGROUND";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #0040ff 0%,
      transparent 50%,
      #0040ff 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${glitch} 2s infinite reverse;
    opacity: 0.1;
  }

  @media (max-width: 480px) {
    margin-bottom: 0.5rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(0, 255, 65, 0.8);
  font-size: clamp(0.85rem, 2.5vw, 1.1rem);
  margin-top: 0.5rem;
  margin-bottom: 0;
  text-align: center;
  line-height: 1.4;
  max-width: 100%;
  word-break: break-word;
  font-family: "Courier New", monospace;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
  animation: ${flicker} 6s infinite;

  /* Add typing effect */
  &::before {
    content: "> ";
    color: #00ff41;
  }

  @media (max-width: 480px) {
    margin-top: 0.25rem;
    padding: 0 0.5rem;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 3rem;
  text-align: center;
  width: 100%;
  max-width: 500px;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }

  /* Landscape mobile */
  @media (max-height: 600px) and (orientation: landscape) {
    margin-bottom: 1rem;
  }
`;

const FormContainer = styled.div`
  background: linear-gradient(
      135deg,
      rgba(0, 20, 0, 0.9) 0%,
      rgba(0, 40, 0, 0.8) 100%
    ),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0, 255, 65, 0.02) 10px,
      rgba(0, 255, 65, 0.02) 11px
    );
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 255, 65, 0.3);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.2),
    inset 0 0 20px rgba(0, 255, 65, 0.05), 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;

  /* Add terminal-like scanlines */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 65, 0.03) 2px,
      rgba(0, 255, 65, 0.03) 4px
    );
    border-radius: 6px;
    pointer-events: none;
  }

  /* Add corner brackets */
  &::after {
    content: "";
    position: absolute;
    inset: 8px;
    border: 1px solid rgba(0, 255, 65, 0.4);
    border-radius: 4px;
    pointer-events: none;
    background: linear-gradient(90deg, #00ff41 0%, transparent 20%) top left,
      linear-gradient(180deg, #00ff41 0%, transparent 20%) top right,
      linear-gradient(270deg, #00ff41 0%, transparent 20%) bottom right,
      linear-gradient(0deg, #00ff41 0%, transparent 20%) bottom left;
    background-size: 20px 20px;
    background-repeat: no-repeat;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 6px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 4px;
    margin: 0 auto;
  }

  /* Landscape mobile */
  @media (max-height: 600px) and (orientation: landscape) {
    padding: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 480px) {
    gap: 1.25rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: rgba(0, 255, 65, 0.9);
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-family: "Courier New", monospace;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.3);

  &::before {
    content: "> ";
    color: #00ff41;
  }
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(0, 20, 0, 0.8) 0%,
    rgba(0, 40, 0, 0.6) 100%
  );
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  color: #00ff41;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-family: "Courier New", monospace;
  transition: all 0.2s ease;
  min-height: 44px;
  -webkit-appearance: none;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
  box-shadow: inset 0 0 10px rgba(0, 255, 65, 0.1),
    0 0 5px rgba(0, 255, 65, 0.2);

  /* Improve mobile input experience */
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 6px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  &:focus {
    outline: none;
    border-color: rgba(0, 255, 65, 0.8);
    background: linear-gradient(
      135deg,
      rgba(0, 40, 0, 0.9) 0%,
      rgba(0, 60, 0, 0.7) 100%
    );
    box-shadow: inset 0 0 15px rgba(0, 255, 65, 0.2),
      0 0 15px rgba(0, 255, 65, 0.4), 0 0 0 2px rgba(0, 255, 65, 0.1);
    transform: translateY(-1px);
    text-shadow: 0 0 8px rgba(0, 255, 65, 0.8);
  }

  &::placeholder {
    color: rgba(0, 255, 65, 0.4);
    font-family: "Courier New", monospace;
  }

  /* Handle password managers */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px rgba(0, 40, 0, 0.8) inset;
    -webkit-text-fill-color: #00ff41;
  }

  /* Add blinking cursor effect */
  &:focus::after {
    content: "";
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 20px;
    background: #00ff41;
    animation: ${flicker} 1s infinite;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const FingerprintButton = styled.button`
  background: radial-gradient(circle, rgba(0, 40, 0, 0.9), rgba(0, 20, 0, 1)),
    repeating-conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(0, 255, 65, 0.1) 10deg,
      transparent 20deg
    );
  border: 2px solid rgba(0, 255, 65, 0.6);
  border-radius: 50%;
  width: clamp(60px, 15vw, 70px);
  height: clamp(60px, 15vw, 70px);
  color: #00ff41;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-family: "Courier New", monospace;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.4),
    inset 0 0 15px rgba(0, 255, 65, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.8);

  /* Add pulsing effect */
  &::before {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1px solid rgba(0, 255, 65, 0.3);
    animation: ${flicker} 2s infinite;
  }

  /* Add rotating scanner effect */
  &::after {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: conic-gradient(
      transparent 270deg,
      rgba(0, 255, 65, 0.8) 280deg,
      rgba(0, 255, 65, 0.4) 290deg,
      transparent 300deg
    );
    animation: spin 3s linear infinite;
    opacity: 0.6;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  &:hover:not(:disabled) {
    border-color: #00ff41;
    box-shadow: 0 0 25px rgba(0, 255, 65, 0.6),
      inset 0 0 20px rgba(0, 255, 65, 0.2);
    transform: scale(1.05);
    text-shadow: 0 0 15px rgba(0, 255, 65, 1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid rgba(0, 255, 65, 0.8);
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    width: 64px;
    height: 64px;

    &:hover:not(:disabled) {
      transform: none;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 255, 65, 0.3);
  border-radius: 50%;
  border-top-color: #00ff41;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff0040;
  text-align: center;
  font-size: clamp(0.8rem, 2.2vw, 0.9rem);
  margin-top: 1rem;
  padding: 0.75rem;
  background: linear-gradient(
    135deg,
    rgba(255, 0, 64, 0.1) 0%,
    rgba(200, 0, 50, 0.1) 100%
  );
  border-radius: 4px;
  border: 1px solid rgba(255, 0, 64, 0.3);
  animation: ${flash} 0.3s ease-in-out, ${glitch} 0.5s ease-in-out;
  font-family: "Courier New", monospace;
  text-shadow: 0 0 5px rgba(255, 0, 64, 0.8);
  box-shadow: 0 0 10px rgba(255, 0, 64, 0.2),
    inset 0 0 10px rgba(255, 0, 64, 0.1);

  &::before {
    content: "⚠ ERROR: ";
    color: #ff0040;
    font-weight: bold;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(
      135deg,
      rgba(0, 255, 65, 0.2) 0%,
      rgba(0, 200, 50, 0.3) 100%
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 65, 0.05) 2px,
      rgba(0, 255, 65, 0.05) 4px
    );
  color: #00ff41;
  border: 1px solid rgba(0, 255, 65, 0.5);
  border-radius: 6px;
  padding: 0.9rem 1.5rem;
  font-size: clamp(0.9rem, 2.2vw, 1rem);
  font-weight: 600;
  font-family: "Courier New", monospace;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.3),
    inset 0 0 15px rgba(0, 255, 65, 0.05);
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.8);
  position: relative;
  overflow: hidden;

  /* Add scanning line effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 65, 0.4) 50%,
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(
        135deg,
        rgba(0, 255, 65, 0.3) 0%,
        rgba(0, 200, 50, 0.4) 100%
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 65, 0.1) 2px,
        rgba(0, 255, 65, 0.1) 4px
      );
    border-color: #00ff41;
    transform: translateY(-1px);
    box-shadow: 0 0 25px rgba(0, 255, 65, 0.5),
      inset 0 0 20px rgba(0, 255, 65, 0.1);
    text-shadow: 0 0 12px rgba(0, 255, 65, 1);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: 2px solid rgba(0, 255, 65, 0.8);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    width: 100%;

    &:hover:not(:disabled) {
      transform: none;
    }
  }
`;

const Footer = styled.div`
  margin-top: 3rem;
  text-align: center;
  color: rgba(0, 255, 65, 0.4);
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  padding: 0 1rem;
  line-height: 1.4;
  font-family: "Courier New", monospace;

  &::before {
    content: "[ ";
    color: rgba(0, 255, 65, 0.6);
  }

  &::after {
    content: " ]";
    color: rgba(0, 255, 65, 0.6);
  }

  @media (max-width: 768px) {
    margin-top: 2rem;
  }

  @media (max-width: 480px) {
    margin-top: 1.5rem;
  }

  /* Landscape mobile */
  @media (max-height: 600px) and (orientation: landscape) {
    margin-top: 1rem;
  }
`;

// Accessibility improvements
const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const SiteLoginPage = memo(() => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null); // 'granted' or 'denied'
  const { siteLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handlePasswordChange = useCallback(
    (e) => {
      setPassword(e.target.value);
      if (error) setError(""); // Clear error when user starts typing
    },
    [error]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!password.trim()) {
        setError("Access key is required");
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const success = await siteLogin(password);

        setAuthStatus(success ? "granted" : "denied");

        setTimeout(() => {
          if (success) {
            navigate("/");
          } else {
            setAuthStatus(null);
            setError("Access Denied. Invalid passphrase.");
          }
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setAuthStatus("denied");
        setTimeout(() => {
          setAuthStatus(null);
          setError("An unexpected error occurred. Please try again.");
          setIsLoading(false);
        }, 1000);
      }
    },
    [password, siteLogin, navigate]
  );

  // Handle enter key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !isLoading) {
        handleSubmit(e);
      }
    },
    [handleSubmit, isLoading]
  );

  return (
    <LoginContainer>
      {authStatus && (
        <Overlay>
          <OverlayText status={authStatus}>
            {authStatus === "granted"
              ? "ACCESS GRANTED\n> INITIALIZING NEURAL LINK...\n> LOADING: [CLASSIFIED].log\n> WELCOME TO THE UNDERGROUND"
              : "ACCESS DENIED\n> BIOMETRIC MISMATCH\n> SECURITY BREACH DETECTED\n> LOCKDOWN INITIATED"}
          </OverlayText>
        </Overlay>
      )}

      <LogoContainer>
        <Logo>SOLO UNDERGROUND</Logo>
        <Subtitle>Decrypting Reality. One Article at a Time.</Subtitle>
      </LogoContainer>

      <FormContainer>
        <TerminalBootText />
        <Form onSubmit={handleSubmit} noValidate>
          <FormGroup>
            <Label htmlFor="password">Access Key</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder="••••••••••"
              required
              autoComplete="current-password"
              aria-describedby={error ? "password-error" : undefined}
              aria-invalid={error ? "true" : "false"}
            />
          </FormGroup>

          <ButtonContainer>
            <SubmitButton
              type="submit"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <VisuallyHidden>SCANNING BIOMETRICS...</VisuallyHidden>
                  <span>SCANNING...</span>
                </>
              ) : (
                <>
                  🔒 <span>INITIATE SEQUENCE</span>
                </>
              )}
            </SubmitButton>

            {/* Alternative fingerprint button for visual appeal */}
            <FingerprintButton
              type="button"
              disabled={isLoading || !password.trim()}
              onClick={handleSubmit}
              aria-label="Biometric scanner (alternative access method)"
            >
              {isLoading ? <LoadingSpinner /> : "⬢"}
            </FingerprintButton>
          </ButtonContainer>

          {error && (
            <ErrorMessage id="password-error" role="alert">
              {error}
            </ErrorMessage>
          )}
        </Form>
      </FormContainer>

      <Footer>
        © {new Date().getFullYear()} Solo Underground. All rights reserved.
      </Footer>
    </LoginContainer>
  );
});

SiteLoginPage.displayName = "SiteLoginPage";

export default SiteLoginPage;
