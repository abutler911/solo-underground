// client/src/components/SiteLoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import TerminalBootText from "./TerminalBootText";

const LoginContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #0a0a0a;
  background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9));
  padding: 1.5rem;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const flash = keyframes`
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

const OverlayText = styled.h2`
  font-family: "Courier New", monospace;
  color: ${(props) => (props.status === "granted" ? "#00ff00" : "#ff4d4d")};
  font-size: 2rem;
  letter-spacing: 1px;
  animation: ${flash} 0.5s ease-in-out;
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 2px;
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-top: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const FormContainer = styled.div`
  background-color: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const FingerprintButton = styled.button`
  background: radial-gradient(circle, #1f1f1f, #000);
  border: 2px solid #444;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  margin: 0 auto;
  color: #ff7e5f;
  font-size: 1.2rem;
  font-family: "Courier New", monospace;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 0 12px rgba(255, 126, 95, 0.3);

  &:hover {
    border-color: #ff7e5f;
    box-shadow: 0 0 18px rgba(255, 126, 95, 0.5);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const Footer = styled.div`
  margin-top: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
`;

const SiteLoginPage = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setError("An unexpected error occurred.");
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <LoginContainer>
      {authStatus && (
        <Overlay>
          <OverlayText status={authStatus}>
            {authStatus === "granted"
              ? "ACCESS GRANTED\n> loading: [REDACTED].log"
              : "ACCESS DENIED"}
          </OverlayText>
        </Overlay>
      )}

      <LogoContainer>
        <Logo>SOLO UNDERGROUND</Logo>
        <Subtitle>Decrypting Reality. One Article at a Time.</Subtitle>
      </LogoContainer>

      <FormContainer>
        <TerminalBootText />
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="password">Access Key</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
            />
          </FormGroup>

          <FingerprintButton type="submit" disabled={isLoading}>
            {isLoading ? "..." : "🔓"}
          </FingerprintButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </FormContainer>

      <Footer>
        © {new Date().getFullYear()} Solo Underground. All rights reserved.
      </Footer>
    </LoginContainer>
  );
};

export default SiteLoginPage;
