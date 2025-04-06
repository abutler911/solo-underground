// client/src/components/admin/AdminLogin.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";

// All styled components remain the same...
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #0a0a0a;
  padding: 1rem;
`;

const LoginPanel = styled.div`
  width: 100%;
  max-width: 420px;
  background-color: rgba(20, 20, 20, 0.7);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
`;

const LoginHeader = styled.div`
  padding: 2rem;
  background: linear-gradient(
    to right,
    rgba(40, 40, 40, 0.8),
    rgba(20, 20, 20, 0.8)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
`;

const Logo = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: 1.5px;
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  margin-top: 0.5rem;
`;

const LoginForm = styled.form`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.75rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
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
  width: 100%;
  padding: 1rem;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.1)
    );
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff5252;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  background-color: rgba(255, 82, 82, 0.1);
  border-radius: 4px;
  border-left: 3px solid #ff5252;
`;

const BackLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  useEffect(() => {
    // Add a subtle animation when the component mounts
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await adminLogin(formData.username, formData.password);

      if (success) {
        navigate("/admin");
      } else {
        setError("The username or password you entered is incorrect.");
      }
    } catch (err) {
      setError("Authentication failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginPanel>
        <LoginHeader>
          <Logo>SOLO UNDERGROUND</Logo>
          <Title>Admin Portal</Title>
        </LoginHeader>

        <LoginForm onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading && <LoadingSpinner />}
            {loading ? "Authenticating..." : "Sign In"}
          </Button>

          <BackLink to="/">← Return to site</BackLink>
        </LoginForm>
      </LoginPanel>
    </LoginContainer>
  );
};

export default AdminLogin;
