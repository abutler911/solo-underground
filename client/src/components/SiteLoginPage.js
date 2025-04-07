// client/src/components/SiteLoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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
`;

const LogoContainer = styled.div`
  margin-bottom: 3rem;
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

const Description = styled.div`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.6;
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

const Button = styled.button`
  background: linear-gradient(135deg, #ff7e5f 0%, #ff6347 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 126, 95, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 126, 95, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
  const { siteLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [typedText, setTypedText] = useState("");
  const terminalText = "> initializing access protocol_...";
  const typingSpeed = 120;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(terminalText.slice(0, i + 1));
      i++;
      if (i >= terminalText.length) clearInterval(interval);
    }, typingSpeed);

    return () => clearInterval(interval);
  }, []);

  // Redirect if already authenticated
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

      if (success) {
        navigate("/");
      } else {
        setError("Invalid password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Decrypting..." : "Enter Secure Zone"}
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </FormContainer>

      <Footer>
        © {new Date().getFullYear()} Solo Underground. All rights reserved.
      </Footer>
    </LoginContainer>
  );
};

const TerminalLine = styled.pre`
  font-family: "Courier New", Courier, monospace;
  color: #00ff00;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  display: inline-block;

  &:after {
    content: "█";
    margin-left: 2px;
    animation: blink 1s step-start infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
`;

const AccessLabel = styled.strong`
  color: #ff7e5f;
  font-size: 1rem;
  display: block;
`;

const Quote = styled.em`
  color: #aaa;
  display: block;
  margin-top: 1.5rem;
`;

export default SiteLoginPage;
