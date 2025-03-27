// client/src/components/TermsPage.js
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

const TermsPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Terms of Use</PageTitle>
        <PageSubtitle>
          Please read these terms carefully before using our website.
        </PageSubtitle>
        <LastUpdated>Last updated: March 30, 2025</LastUpdated>
      </PageHeader>

      <Section>
        <TextContent>
          <p>
            Welcome to Solo Underground ("we," "us," or "our"). These Terms of
            Use govern your access to and use of Solo Underground, including any
            content, functionality, and services offered on or through our
            website.
          </p>
          <p>
            By accessing or using our website, you accept and agree to be bound
            by these Terms of Use. If you do not agree to these Terms of Use,
            you must not access or use our website.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Site Access and Account Security</SectionTitle>
        <TextContent>
          <p>
            Solo Underground requires a password for access to our content. By
            creating or using an account, you agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information about yourself</li>
            <li>Maintain the security of your password and identification</li>
            <li>Promptly update any information about you that changes</li>
            <li>
              Notify us immediately of any unauthorized access to or use of your
              username or password
            </li>
            <li>
              Ensure that you exit from your account at the end of each session
            </li>
          </ul>
          <p>
            We have the right to disable any user identification code or
            password, whether chosen by you or provided by us, at any time if,
            in our opinion, you have violated any provision of these Terms of
            Use.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Intellectual Property Rights</SectionTitle>
        <TextContent>
          <p>
            The website and its entire contents, features, and functionality
            (including but not limited to all information, text, images, audio,
            video, and design) are owned by Solo Underground, its licensors, or
            other providers of such material and are protected by copyright,
            trademark, patent, trade secret, and other intellectual property or
            proprietary rights laws.
          </p>
          <p>
            You may access material on Solo Underground only for your personal,
            non-commercial use. You must not:
          </p>
          <ul>
            <li>
              Reproduce, distribute, modify, create derivative works of,
              publicly display, publicly perform, republish, download, store, or
              transmit any material from our website, except as explicitly
              permitted
            </li>
            <li>
              Delete or alter any copyright, trademark, or other proprietary
              rights notices from copies of materials from this site
            </li>
            <li>
              Access or use for any commercial purposes any part of the website
            </li>
          </ul>
          <p>
            Limited quotation of our content is permitted for the purpose of
            criticism, comment, news reporting, teaching, scholarship, or
            research, in accordance with the "fair use" provisions of copyright
            law.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>User Contributions</SectionTitle>
        <TextContent>
          <p>
            Our website may contain comment sections, message boards, personal
            profiles, forums, and other interactive features that allow you to
            post, submit, publish, display, or transmit content or materials.
            All such contributions must comply with the Content Standards set
            out in these Terms of Use.
          </p>
          <p>
            Any content you post to the site will be considered non-confidential
            and non-proprietary. By providing any contribution on the website,
            you grant us and our affiliates a perpetual, worldwide,
            non-exclusive, royalty-free, transferable license to use, reproduce,
            modify, perform, display, distribute, and otherwise disclose to
            third parties any such material.
          </p>
          <p>You represent and warrant that:</p>
          <ul>
            <li>
              You own or control all rights in and to the content you contribute
            </li>
            <li>
              All of your contributions comply with applicable law and these
              Terms of Use
            </li>
            <li>
              Your contributions do not violate the rights of any third party
            </li>
          </ul>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Content Standards</SectionTitle>
        <TextContent>
          <p>
            These content standards apply to any and all contributions to our
            site. Your contributions must not:
          </p>
          <ul>
            <li>
              Contain any material that is defamatory, obscene, indecent,
              abusive, offensive, harassing, violent, hateful, inflammatory, or
              otherwise objectionable
            </li>
            <li>
              Promote sexually explicit or pornographic material, violence, or
              discrimination
            </li>
            <li>
              Infringe any patent, trademark, trade secret, copyright, or other
              intellectual property rights
            </li>
            <li>
              Violate the legal rights of others or contain any material that
              could violate any applicable law
            </li>
            <li>
              Impersonate any person, or misrepresent your identity or
              affiliation with any person or organization
            </li>
            <li>
              Involve commercial activities or sales such as promotions,
              contests, or advertising
            </li>
            <li>
              Give the impression that they emanate from or are endorsed by us
              or any other person or entity
            </li>
          </ul>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Subscription and Payment Terms</SectionTitle>
        <TextContent>
          <p>
            Access to certain content on Solo Underground requires a
            subscription and site password. By subscribing to our service, you
            agree to:
          </p>
          <ul>
            <li>Provide accurate and complete payment information</li>
            <li>Promptly update your billing information if it changes</li>
            <li>
              Pay all charges incurred through your account at the rates in
              effect when the charges were incurred
            </li>
          </ul>
          <p>
            We may modify our subscription fees at any time. If we modify the
            fees for your subscription plan, we will provide notice of the
            change through the website or by email at least 30 days before the
            change takes effect.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Termination</SectionTitle>
        <TextContent>
          <p>
            We may terminate or suspend your account and access to the website
            immediately, without prior notice or liability, if you breach any
            term or condition outlined in these Terms of Use.
          </p>
          <p>
            Upon termination, your right to use the website will immediately
            cease. If you wish to terminate your account, you may simply
            discontinue using the website and cancel your subscription.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Limitation of Liability</SectionTitle>
        <TextContent>
          <p>
            In no event will Solo Underground, its affiliates, or their
            licensors, service providers, employees, agents, officers, or
            directors be liable for damages of any kind arising out of or in
            connection with your use, or inability to use, the website,
            including any direct, indirect, special, incidental, consequential,
            or punitive damages.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Indemnification</SectionTitle>
        <TextContent>
          <p>
            You agree to defend, indemnify, and hold harmless Solo Underground,
            its affiliates, licensors, and service providers, and its and their
            respective officers, directors, employees, contractors, agents,
            licensors, suppliers, successors, and assigns from and against any
            claims, liabilities, damages, judgments, awards, losses, costs,
            expenses, or fees (including reasonable attorneys' fees) arising out
            of or relating to your violation of these Terms of Use or your use
            of the website.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Governing Law and Jurisdiction</SectionTitle>
        <TextContent>
          <p>
            These Terms of Use and any dispute or claim arising out of or in
            connection with them shall be governed by and construed in
            accordance with the laws of the state of New York, without giving
            effect to any choice or conflict of law provision or rule.
          </p>
          <p>
            Any legal suit, action, or proceeding arising out of, or related to,
            these Terms of Use or the website shall be instituted exclusively in
            the federal courts of the United States or the courts of the state
            of New York. You waive any and all objections to the exercise of
            jurisdiction over you by such courts and to venue in such courts.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Changes to the Terms of Use</SectionTitle>
        <TextContent>
          <p>
            We may revise and update these Terms of Use from time to time in our
            sole discretion. All changes are effective immediately when we post
            them.
          </p>
          <p>
            Your continued use of the website following the posting of revised
            Terms of Use means that you accept and agree to the changes. You are
            expected to check this page from time to time so you are aware of
            any changes, as they are binding on you.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Contact Us</SectionTitle>
        <TextContent>
          <p>
            If you have any questions about these Terms of Use, please contact
            us:
          </p>
          <p>
            By email:{" "}
            <a href="mailto:terms@solounderground.com">
              terms@solounderground.com
            </a>
          </p>
        </TextContent>
      </Section>
    </PageContainer>
  );
};

export default TermsPage;
