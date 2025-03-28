// client/src/components/FeaturedQuote.js
import React from "react";
import styled from "styled-components";

const LeftQuoteContainer = styled.div`
  float: left;
  width: 35%;
  margin: 1rem 2rem 1rem 0;
  clear: left;
  box-sizing: border-box;

  /* Ensure it's not too narrow on medium screens */
  @media (max-width: 1024px) and (min-width: 769px) {
    width: 40%;
  }

  @media (max-width: 768px) {
    width: 100%;
    float: none;
    margin: 2rem 0;
  }
`;

const RightQuoteContainer = styled.div`
  float: right;
  width: 35%;
  margin: 1rem 0 1rem 2rem;
  clear: right;
  box-sizing: border-box;

  /* Ensure it's not too narrow on medium screens */
  @media (max-width: 1024px) and (min-width: 769px) {
    width: 40%;
  }

  @media (max-width: 768px) {
    width: 100%;
    float: none;
    margin: 2rem 0;
  }
`;

const CenterQuoteContainer = styled.div`
  width: 100%;
  margin: 2.5rem 0;
  clear: both;
  box-sizing: border-box;
`;

const QuoteBox = styled.blockquote`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 2rem 1.75rem 1.5rem;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 3px solid rgba(255, 255, 255, 0.4);
  font-family: "Merriweather", Georgia, serif;
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  box-sizing: border-box;
  width: 100%;

  &:before {
    content: '"';
    position: absolute;
    top: 0.5rem;
    left: 0.75rem;
    font-size: 2.5rem;
    opacity: 0.15;
    font-family: Georgia, serif;
    line-height: 1;
  }
`;

const QuoteText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: ${(props) => (props.$hasAttribution ? "0.75rem" : "0")};
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  padding: 0 0.5rem;
`;

const QuoteAttribution = styled.footer`
  font-size: 0.8rem;
  text-align: right;
  opacity: 0.8;
  font-family: "Libre Franklin", sans-serif;
  font-style: normal;
  font-weight: 500;

  &:before {
    content: "— ";
  }
`;

const FeaturedQuote = ({ quote }) => {
  // Determine which container to use based on position
  let QuoteContainer;
  switch (quote.position) {
    case "left":
      QuoteContainer = LeftQuoteContainer;
      break;
    case "center":
      QuoteContainer = CenterQuoteContainer;
      break;
    case "right":
    default:
      QuoteContainer = RightQuoteContainer;
      break;
  }

  return (
    <QuoteContainer>
      <QuoteBox>
        <QuoteText $hasAttribution={!!quote.attribution}>
          {quote.text}
        </QuoteText>
        {quote.attribution && (
          <QuoteAttribution>{quote.attribution}</QuoteAttribution>
        )}
      </QuoteBox>
    </QuoteContainer>
  );
};

export default FeaturedQuote;
