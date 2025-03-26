// client/src/components/common/Header.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";

const HeaderContainer = styled.header`
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  backdrop-filter: blur(10px);
  background-color: rgba(10, 10, 10, 0.85);
  z-index: 100;
  transition: padding 0.3s ease;

  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 1.5px;
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: ${(props) => (props.$active ? "#ffffff" : "rgba(255, 255, 255, 0.7)")};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  position: relative;
  transition: color 0.2s ease;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }

  &:after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #ffffff;
    transform: scaleX(${(props) => (props.$active ? "1" : "0")});
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #ffffff;

    &:after {
      transform: scaleX(1);
    }
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfileIcon = styled.div`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

const AdminButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 1rem;
  display: block;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #0a0a0a;
  z-index: 99;
  transform: translateX(${(props) => (props.$isOpen ? "0" : "100%")});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 5rem 2rem;
`;

const MobileNavLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  font-family: "Playfair Display", serif;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Header = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current path matches the link
  const isActive = (path) => location.pathname === path;

  // Change header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <HeaderContainer
        style={{
          padding: isScrolled ? "0.75rem 1.5rem" : "1.25rem 1.5rem",
        }}
      >
        <Logo to="/">SOLO UNDERGROUND</Logo>

        <Nav>
          <NavLink to="/" $active={isActive("/")}>
            Home
          </NavLink>
          <NavLink to="/latest" $active={isActive("/latest")}>
            Latest
          </NavLink>
          <NavLink to="/audio" $active={isActive("/audio")}>
            Audio
          </NavLink>
          <NavLink to="/explore" $active={isActive("/explore")}>
            Explore
          </NavLink>

          <ProfileContainer>
            {isAuthenticated ? (
              <AdminButton to="/admin">Admin</AdminButton>
            ) : (
              <ProfileIcon />
            )}
            <MobileMenuButton onClick={toggleMobileMenu}>☰</MobileMenuButton>
          </ProfileContainer>
        </Nav>
      </HeaderContainer>

      <MobileMenu $isOpen={mobileMenuOpen}>
        <CloseButton onClick={toggleMobileMenu}>✕</CloseButton>
        <MobileNavLink to="/" onClick={toggleMobileMenu}>
          Home
        </MobileNavLink>
        <MobileNavLink to="/latest" onClick={toggleMobileMenu}>
          Latest
        </MobileNavLink>
        <MobileNavLink to="/audio" onClick={toggleMobileMenu}>
          Audio
        </MobileNavLink>
        <MobileNavLink to="/explore" onClick={toggleMobileMenu}>
          Explore
        </MobileNavLink>
        <MobileNavLink to="/search" onClick={toggleMobileMenu}>
          Search
        </MobileNavLink>
        {isAuthenticated && (
          <MobileNavLink to="/admin" onClick={toggleMobileMenu}>
            Admin
          </MobileNavLink>
        )}
      </MobileMenu>
    </>
  );
};

export default Header;
