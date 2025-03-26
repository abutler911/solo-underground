// client/src/components/common/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: #0a0a0a;
  color: rgba(255, 255, 255, 0.7);
  padding: 3rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: "Source Sans Pro", sans-serif;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
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

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const SocialLink = styled.a`
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.25rem;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    transform: translateY(-2px);
  }
`;

const BottomBar = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  margin-top: 3rem;
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

const BottomLink = styled(Link)`
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
`;

// Social media icons (using unicode symbols as placeholders)
const socialIcons = {
  twitter: "✦",
  instagram: "⊡",
  facebook: "⊞",
  spotify: "♪",
  youtube: "▶",
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
          <SocialLinks>
            <SocialLink href="#" aria-label="Twitter">
              {socialIcons.twitter}
            </SocialLink>
            <SocialLink href="#" aria-label="Instagram">
              {socialIcons.instagram}
            </SocialLink>
            <SocialLink href="#" aria-label="Facebook">
              {socialIcons.facebook}
            </SocialLink>
            <SocialLink href="#" aria-label="Spotify">
              {socialIcons.spotify}
            </SocialLink>
            <SocialLink href="#" aria-label="YouTube">
              {socialIcons.youtube}
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <FooterHeading>Explore</FooterHeading>
          <FooterLinks>
            <FooterLink to="/latest">Latest Stories</FooterLink>
            <FooterLink to="/audio">Audio Features</FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterHeading>Info</FooterHeading>
          <FooterLinks>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/subscribe">Subscribe</FooterLink>
            <FooterLink to="/contributors">Contributors</FooterLink>
            <FooterLink to="/support">Support Us</FooterLink>
          </FooterLinks>
        </FooterSection>
      </FooterContent>

      <BottomBar>
        <Copyright>
          © {currentYear} Solo Underground. All rights reserved.
        </Copyright>
        <BottomLinks>
          <BottomLink to="/privacy">Privacy Policy</BottomLink>
          <BottomLink to="/terms">Terms of Use</BottomLink>
          <BottomLink to="/cookies">Cookie Policy</BottomLink>
        </BottomLinks>
      </BottomBar>
    </FooterContainer>
  );
};

export default Footer;
