// client/src/components/admin/QuotePreview.js
import React from "react";
import styled from "styled-components";

const PreviewContainer = styled.div`
  margin: 1rem 0 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const PreviewTitle = styled.h4`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }
`;

const QuotePreviewBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 2rem 1.75rem 1.5rem;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-left: 3px solid rgba(255, 255, 255, 0.4);
  position: relative;
  margin-bottom: ${(props) => (props.$last ? "0" : "1rem")};
  font-family: "Merriweather", Georgia, serif;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;

  &:before {
    content: '"';
    position: absolute;
    top: 0.25rem;
    left: 0.5rem;
    font-size: 2.5rem;
    opacity: 0.15;
    font-family: Georgia, serif;
    line-height: 1;
  }
`;

const QuoteText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: ${(props) => (props.$hasAttribution ? "0.75rem" : "0")};
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  padding: 0 0.5rem;
`;

const QuoteAttribution = styled.div`
  font-size: 0.85rem;
  text-align: right;
  opacity: 0.8;
  font-family: "Libre Franklin", sans-serif;
  font-style: normal;

  &:before {
    content: "— ";
  }
`;

const PositionBadge = styled.div`
  position: absolute;
  top: -0.5rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-family: "Libre Franklin", sans-serif;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 1rem;
  font-size: 0.9rem;
`;

const QuotePreview = ({ quotes = [] }) => {
  const validQuotes = quotes.filter((quote) => quote.text.trim() !== "");

  if (validQuotes.length === 0) {
    return (
      <PreviewContainer>
        <PreviewTitle>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 8H3V14H7V8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 8H13V14H17V8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 14L7 18V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 14L17 18V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Quote Preview
        </PreviewTitle>
        <EmptyState>
          No quotes to preview. Add a quote to see how it will appear in your
          article.
        </EmptyState>
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer>
      <PreviewTitle>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 8H3V14H7V8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 8H13V14H17V8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 14L7 18V14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 14L17 18V14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Quote Preview
      </PreviewTitle>

      {validQuotes.map((quote, index) => (
        <QuotePreviewBox key={index} $last={index === validQuotes.length - 1}>
          <PositionBadge>{quote.position || "right"} position</PositionBadge>
          <QuoteText $hasAttribution={!!quote.attribution}>
            {quote.text}
          </QuoteText>
          {quote.attribution && (
            <QuoteAttribution>{quote.attribution}</QuoteAttribution>
          )}
        </QuotePreviewBox>
      ))}
    </PreviewContainer>
  );
};

export default QuotePreview;
