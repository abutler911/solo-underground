// client/src/components/PrivacyPolicyPage.js
import React, { useEffect } from "react";
import styled from "styled-components";

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 3rem;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 1),
    rgba(210, 210, 210, 0.8)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: "Playfair Display", serif;
  line-height: 1.2;
`;

const PageSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  max-width: 600px;
`;

const LastUpdated = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1rem;
  font-style: italic;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: white;
  font-family: "Playfair Display", serif;
`;

const SubSection = styled.div`
  margin-bottom: 2rem;
`;

const SubSectionTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
`;

const TextContent = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.8;

  p {
    margin-bottom: 1.5rem;
  }

  a {
    color: #4e95cb;
    text-decoration: none;
    border-bottom: 1px solid rgba(78, 149, 203, 0.3);
    transition: all 0.2s ease;

    &:hover {
      border-bottom-color: #4e95cb;
    }
  }

  ul {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.75rem;
    }
  }
`;

const PrivacyPolicyPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Privacy Policy</PageTitle>
        <PageSubtitle>
          How we collect, use, and protect your personal information.
        </PageSubtitle>
        <LastUpdated>Last updated: March 30, 2025</LastUpdated>
      </PageHeader>

      <Section>
        <TextContent>
          <p>
            Solo Underground ("we," "us," or "our") is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website,
            including any other media form, media channel, mobile website, or
            mobile application related or connected to Solo Underground.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with
            the terms of this privacy policy, please do not access the site.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Information We Collect</SectionTitle>

        <SubSection>
          <SubSectionTitle>Personal Data</SubSectionTitle>
          <TextContent>
            <p>
              Personally identifiable information may include, but is not
              limited to:
            </p>
            <ul>
              <li>Email address (if you subscribe to our newsletter)</li>
              <li>Name (if you choose to provide it)</li>
              <li>Usage data</li>
            </ul>
          </TextContent>
        </SubSection>

        <SubSection>
          <SubSectionTitle>Usage Data</SubSectionTitle>
          <TextContent>
            <p>
              We may also collect information about how the website is accessed
              and used ("Usage Data"). This Usage Data may include information
              such as your computer's Internet Protocol address (e.g., IP
              address), browser type, browser version, the pages of our website
              that you visit, the time and date of your visit, the time spent on
              those pages, unique device identifiers, and other diagnostic data.
            </p>
          </TextContent>
        </SubSection>

        <SubSection>
          <SubSectionTitle>Tracking & Cookies Data</SubSectionTitle>
          <TextContent>
            <p>
              We use cookies and similar tracking technologies to track activity
              on our website and hold certain information. Cookies are files
              with a small amount of data which may include an anonymous unique
              identifier.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our website.
            </p>
            <p>Examples of Cookies we use:</p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> We use Session Cookies to
                operate our website.
              </li>
              <li>
                <strong>Preference Cookies:</strong> We use Preference Cookies
                to remember your preferences and various settings.
              </li>
              <li>
                <strong>Security Cookies:</strong> We use Security Cookies for
                security purposes.
              </li>
            </ul>
          </TextContent>
        </SubSection>
      </Section>

      <Section>
        <SectionTitle>Use of Data</SectionTitle>
        <TextContent>
          <p>Solo Underground uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our website</li>
            <li>To notify you about changes to our website</li>
            <li>
              To allow you to participate in interactive features of our website
              when you choose to do so
            </li>
            <li>To provide customer support</li>
            <li>
              To gather analysis or valuable information so that we can improve
              our website
            </li>
            <li>To monitor the usage of our website</li>
            <li>To detect, prevent and address technical issues</li>
            <li>
              To provide you with news, special offers, and general information
              about other goods, services, and events which we offer
            </li>
          </ul>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Data Security</SectionTitle>
        <TextContent>
          <p>
            The security of your data is important to us, but remember that no
            method of transmission over the Internet or method of electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your personal data, we cannot guarantee
            its absolute security.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Your Data Protection Rights</SectionTitle>
        <TextContent>
          <p>
            We would like to make sure you are fully aware of all of your data
            protection rights. Every user is entitled to the following:
          </p>
          <ul>
            <li>
              <strong>The right to access</strong> – You have the right to
              request copies of your personal data.
            </li>
            <li>
              <strong>The right to rectification</strong> – You have the right
              to request that we correct any information you believe is
              inaccurate. You also have the right to request that we complete
              information you believe is incomplete.
            </li>
            <li>
              <strong>The right to erasure</strong> – You have the right to
              request that we erase your personal data, under certain
              conditions.
            </li>
            <li>
              <strong>The right to restrict processing</strong> – You have the
              right to request that we restrict the processing of your personal
              data, under certain conditions.
            </li>
            <li>
              <strong>The right to object to processing</strong> – You have the
              right to object to our processing of your personal data, under
              certain conditions.
            </li>
            <li>
              <strong>The right to data portability</strong> – You have the
              right to request that we transfer the data that we have collected
              to another organization, or directly to you, under certain
              conditions.
            </li>
          </ul>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Changes to This Privacy Policy</SectionTitle>
        <TextContent>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date at the top of this Privacy
            Policy.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Contact Us</SectionTitle>
        <TextContent>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <p>
            By email:{" "}
            <a href="mailto:privacy@solounderground.com">
              privacy@solounderground.com
            </a>
          </p>
        </TextContent>
      </Section>
    </PageContainer>
  );
};

export default PrivacyPolicyPage;
