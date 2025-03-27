// client/src/components/common/Footer.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useEffect } from "react";

const FooterContainer = styled.footer`
  background-color: #0a0a0a;
  color: rgba(255, 255, 255, 0.7);
  padding: 2.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: "Source Sans Pro", sans-serif;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const FooterHeading = styled.h3`
  color: #ffffff;
  margin-bottom: 1.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 2rem;
    height: 2px;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.5),
      rgba(255, 255, 255, 0)
    );
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// Custom link component that scrolls to top on click
const ScrollToTopLink = ({ to, children, className }) => {
  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

const FooterLink = styled(ScrollToTopLink)`
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

const BottomBar = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1.5rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Copyright = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const BottomLink = styled(ScrollToTopLink)`
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
`;

// ScrollToTop component to handle scroll restoration on page navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <Logo>SOLO UNDERGROUND</Logo>
          <FooterText>
            No sponsors. No gatekeepers. Just sharp takes and unfiltered truth
            from the edge of the mainstream.
          </FooterText>
        </FooterSection>

        <FooterSection>
          <FooterHeading>Navigation</FooterHeading>
          <FooterLinks>
            <FooterLink to="/latest">Latest Stories</FooterLink>
            <FooterLink to="/audio">Audio Features</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/contributors">Contributors</FooterLink>
          </FooterLinks>
        </FooterSection>
      </FooterContent>

      <BottomBar>
        <Copyright>
          © {currentYear} Solo Underground. All rights reserved.
        </Copyright>
        <BottomLinks>
          <BottomLink to="/privacy">Privacy</BottomLink>
          <BottomLink to="/terms">Terms</BottomLink>
        </BottomLinks>
      </BottomBar>
    </FooterContainer>
  );
};

export default Footer;
