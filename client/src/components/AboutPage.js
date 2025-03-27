// client/src/components/AboutPage.js
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
`;

const AboutPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>About Solo Underground</PageTitle>
        <PageSubtitle>
          Independent journalism and analysis from the edge of the mainstream.
        </PageSubtitle>
      </PageHeader>

      <Section>
        <SectionTitle>Our Mission</SectionTitle>
        <TextContent>
          <p>
            Solo Underground was founded on the belief that independent voices
            matter. We publish original, in-depth journalism that challenges
            conventional thinking and provides perspectives often overlooked by
            traditional media outlets.
          </p>
          <p>
            As a proudly independent publication, we are free from corporate
            influence, allowing us to pursue stories based on their merit and
            importance rather than their potential for virality or advertiser
            appeal. Our work sits at the intersection of investigative
            reporting, cultural analysis, and thoughtful commentary.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Our Values</SectionTitle>
        <TextContent>
          <p>
            <strong>Independence</strong> — We are funded directly by our
            readers, free from corporate influence and institutional pressures.
          </p>
          <p>
            <strong>Integrity</strong> — We are committed to factual accuracy,
            transparency, and ethical reporting practices.
          </p>
          <p>
            <strong>Depth</strong> — We believe in taking the time to explore
            complex issues thoroughly, beyond the constraints of the news cycle.
          </p>
          <p>
            <strong>Perspective</strong> — We seek out untold stories and
            underrepresented viewpoints, challenging ourselves and our readers
            to see beyond conventional narratives.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Behind Solo Underground</SectionTitle>
        <TextContent>
          <p>
            Solo Underground was founded in 2024 by a small team of journalists,
            researchers, and writers committed to independent media. After years
            of working within traditional media organizations, we set out to
            build a publication that would prioritize editorial independence and
            in-depth coverage.
          </p>
          <p>
            Our contributors include both established voices and emerging
            writers who bring diverse perspectives and expertise to our pages.
            While we remain small by design, our network of contributors spans
            the globe.
          </p>
        </TextContent>
      </Section>

      <Section>
        <SectionTitle>Contact Us</SectionTitle>
        <TextContent>
          <p>
            We welcome feedback, story ideas, and inquiries from our readers.
          </p>
          <p>
            For general inquiries:{" "}
            <a href="mailto:contact@solounderground.com">
              contact@solounderground.com
            </a>
          </p>
          <p>
            For submission guidelines and pitches:{" "}
            <a href="mailto:submissions@solounderground.com">
              submissions@solounderground.com
            </a>
          </p>
          <p>
            Follow us on social media for updates and behind-the-scenes content.
          </p>
        </TextContent>
      </Section>
    </PageContainer>
  );
};

export default AboutPage;
