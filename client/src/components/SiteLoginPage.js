// client/src/components/SiteLoginPage.js
import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import TerminalBootText from "./TerminalBootText";

const LoginContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #0a0a0a;
  background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9));
  padding: 1.5rem;
  position: relative;

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
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(5px);
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
  color: ${(props) => (props.status === "granted" ? "#00ff00" : "#ff4d4d")};
  font-size: clamp(1.2rem, 5vw, 2rem);
  letter-spacing: clamp(0.5px, 0.2vw, 1px);
  animation: ${flash} 0.5s ease-in-out;
  text-align: center;
  white-space: pre-line;
  padding: 0 1rem;
  line-height: 1.4;

  /* Add typewriter effect for granted status */
  ${(props) =>
    props.status === "granted" &&
    `
    overflow: hidden;
    border-right: 2px solid #00ff00;
    white-space: nowrap;
    animation: ${typewriter} 1.5s steps(40, end), ${flash} 0.5s ease-in-out;
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
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  text-align: center;
  line-height: 1.1;
  word-break: break-word;

  @media (max-width: 480px) {
    margin-bottom: 0.5rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: clamp(0.85rem, 2.5vw, 1.1rem);
  margin-top: 0.5rem;
  margin-bottom: 0;
  text-align: center;
  line-height: 1.4;
  max-width: 100%;
  word-break: break-word;

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
  background-color: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;

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
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  transition: all 0.2s ease;
  min-height: 44px; /* Touch target size */
  -webkit-appearance: none; /* Remove iOS styling */

  /* Improve mobile input experience */
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 6px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  /* Handle password managers */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.05) inset;
    -webkit-text-fill-color: white;
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
  background: radial-gradient(circle, #1f1f1f, #000);
  border: 2px solid #444;
  border-radius: 50%;
  width: clamp(60px, 15vw, 70px);
  height: clamp(60px, 15vw, 70px);
  color: #ff7e5f;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-family: "Courier New", monospace;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 0 12px rgba(255, 126, 95, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px; /* Touch target */
  min-width: 44px;

  &:hover:not(:disabled) {
    border-color: #ff7e5f;
    box-shadow: 0 0 18px rgba(255, 126, 95, 0.5);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid rgba(255, 126, 95, 0.5);
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    width: 64px;
    height: 64px;

    &:hover:not(:disabled) {
      transform: none; /* Disable hover transform on small mobile */
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 126, 95, 0.3);
  border-radius: 50%;
  border-top-color: #ff7e5f;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  font-size: clamp(0.8rem, 2.2vw, 0.9rem);
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  animation: ${flash} 0.3s ease-in-out;
`;

const SubmitButton = styled.button`
  background: linear-gradient(
    135deg,
    rgba(255, 126, 95, 0.8) 0%,
    rgba(255, 99, 132, 0.8) 100%
  );
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.9rem 1.5rem;
  font-size: clamp(0.9rem, 2.2vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(255, 126, 95, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      rgba(255, 126, 95, 1) 0%,
      rgba(255, 99, 132, 1) 100%
    );
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(255, 126, 95, 0.4);
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
    outline: 2px solid rgba(255, 126, 95, 0.5);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  @media (max-width: 480px) {
    width: 100%;

    &:hover:not(:disabled) {
      transform: none; /* Disable hover transform on mobile */
    }
  }
`;

const Footer = styled.div`
  margin-top: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  padding: 0 1rem;
  line-height: 1.4;

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
                  <VisuallyHidden>Authenticating...</VisuallyHidden>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  🔓 <span>Access System</span>
                </>
              )}
            </SubmitButton>

            {/* Alternative fingerprint button for visual appeal */}
            <FingerprintButton
              type="button"
              disabled={isLoading || !password.trim()}
              onClick={handleSubmit}
              aria-label="Biometric access (alternative login method)"
            >
              {isLoading ? <LoadingSpinner /> : "🔓"}
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
