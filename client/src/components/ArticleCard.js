// client/src/components/ArticleCard.js
import React, { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Performance optimization: Move formatDate outside component
const formatDate = (dateString) => {
  const options = { month: "long", day: "numeric", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const Card = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease;
  font-family: "PT Serif", Georgia, serif;

  &:hover {
    transform: translateY(-5px);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;

    &:hover {
      transform: translateY(-2px); /* Reduced transform for mobile */
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 1.25rem;

    &:hover {
      transform: none; /* Disable hover transform on small mobile */
    }
  }
`;

const ArticleLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;

  /* Improve tap targets */
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
`;

const ArticleImage = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  position: relative;
  overflow: hidden;
  border-radius: 8px 8px 0 0;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    will-change: transform; /* Performance hint */
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
    z-index: 1;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    border-radius: 6px 6px 0 0;
    padding-bottom: 60%; /* Slightly taller aspect ratio for mobile */

    &:hover img {
      transform: scale(1.02); /* Reduced scale on mobile */
    }
  }

  @media (max-width: 480px) {
    border-radius: 4px 4px 0 0;

    &:hover img {
      transform: none; /* Disable image scaling on small mobile */
    }

    &:after {
      height: 60%; /* Reduce gradient height on mobile */
    }
  }
`;

// Loading placeholder for images
const ImagePlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const ArticleInfo = styled.div`
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ArticleCategory = styled.div`
  font-family: "Libre Franklin", sans-serif;
  font-size: clamp(0.7rem, 2vw, 0.75rem);
  text-transform: uppercase;
  letter-spacing: clamp(0.8px, 0.2vw, 1.2px);
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.7);

  @media (max-width: 480px) {
    margin-bottom: 0.5rem;
  }
`;

const ArticleTitle = styled.h2`
  font-family: "Merriweather", Georgia, serif;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  font-weight: 700;
  margin: 0.5rem 0 1rem;
  line-height: 1.2;
  letter-spacing: -0.25px;
  word-break: break-word;
  hyphens: auto;

  /* Limit lines on mobile for better layout */
  @media (max-width: 480px) {
    margin: 0.4rem 0 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ArticleMetadata = styled.div`
  font-family: "Libre Franklin", sans-serif;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-bottom: 0.6rem;
  }
`;

const Author = styled.span`
  font-weight: 500;
`;

const ArticleSummary = styled.p`
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
  font-family: "PT Serif", Georgia, serif;

  /* Limit lines for consistent card heights */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
    line-height: 1.6;
    -webkit-line-clamp: 2;
  }

  @media (max-width: 480px) {
    margin-bottom: 1rem;
    line-height: 1.5;
  }
`;

const ArticleFooter = styled.div`
  font-family: "Libre Franklin", sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: rgba(255, 255, 255, 0.5);
  font-size: clamp(0.7rem, 1.8vw, 0.75rem);
  margin-top: 1rem;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
`;

const ReadMore = styled.span`
  font-family: "Libre Franklin", sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
  font-weight: 600;
  color: #ffffff;
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease;

  &:after {
    content: "";
    position: absolute;
    bottom: 0.2rem;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #ffffff;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }

  ${Card}:hover &:after {
    transform: scaleX(1);
    transform-origin: left;
  }

  /* Add arrow icon */
  &:before {
    content: "→";
    font-size: 1.1em;
    transition: transform 0.3s ease;
  }

  ${Card}:hover &:before {
    transform: translateX(4px);
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0;

    ${Card}:hover &:before {
      transform: none; /* Disable arrow animation on mobile */
    }
  }
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 0.4rem;
    margin-top: 0.75rem;
  }
`;

const Tag = styled.span`
  font-family: "Libre Franklin", sans-serif;
  padding: 0.3rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 2rem;
  font-size: clamp(0.65rem, 1.8vw, 0.7rem);
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 480px) {
    padding: 0.25rem 0.6rem;
    border-radius: 1.5rem;
  }
`;

const CitationCount = styled.div`
  font-family: "Libre Franklin", sans-serif;
  margin-top: 0.5rem;
  font-size: clamp(0.75rem, 2vw, 0.8rem);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    width: clamp(12px, 2.5vw, 14px);
    height: clamp(12px, 2.5vw, 14px);
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    margin-top: 0.4rem;
    gap: 0.3rem;
  }
`;

// Error state for broken images
const ImageError = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  text-align: center;
  padding: 1rem;
`;

// Enhanced image component with loading and error states
const EnhancedImage = memo(({ src, alt, onLoad, onError }) => {
  const [imageState, setImageState] = useState("loading");

  const handleLoad = useCallback(() => {
    setImageState("loaded");
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageState("error");
    onError?.();
  }, [onError]);

  return (
    <>
      {imageState === "loading" && <ImagePlaceholder />}
      {imageState === "error" && (
        <ImageError>
          <div>
            <div>📷</div>
            <div>Image unavailable</div>
          </div>
        </ImageError>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: imageState === "loaded" ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        loading="lazy" // Native lazy loading
      />
    </>
  );
});

const ArticleCard = memo(({ article }) => {
  const {
    _id,
    title,
    summary,
    category,
    author,
    publishedAt,
    coverImage,
    photoCredit,
    tags,
    citations,
  } = article;

  // Helper function for scroll to top when clicking an article
  const handleArticleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Limit tags shown on mobile
  const displayTags = tags?.slice(0, 3) || [];
  const hasMoreTags = tags && tags.length > 3;

  return (
    <Card>
      <ArticleLink to={`/article/${_id}`} onClick={handleArticleClick}>
        {coverImage && (
          <ArticleImage>
            <EnhancedImage src={coverImage} alt={title} />
          </ArticleImage>
        )}

        <ArticleInfo>
          {category && <ArticleCategory>{category}</ArticleCategory>}
          <ArticleTitle>{title}</ArticleTitle>

          <ArticleMetadata>
            {author && <Author>By {author}</Author>}
            {publishedAt && <span>• {formatDate(publishedAt)}</span>}
          </ArticleMetadata>

          {summary && <ArticleSummary>{summary}</ArticleSummary>}

          <ReadMore>Read article</ReadMore>

          {citations && citations.length > 0 && (
            <CitationCount>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 8H3C2.44772 8 2 8.44772 2 9V14C2 14.5523 2.44772 15 3 15H7V18C7 18.5523 7.44772 19 8 19H9C9.55228 19 10 18.5523 10 18V9C10 8.44772 9.55228 8 9 8H8C7.44772 8 7 8.44772 7 9V15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8H13C12.4477 8 12 8.44772 12 9V14C12 14.5523 12.4477 15 13 15H17V18C17 18.5523 17.4477 19 18 19H19C19.5523 19 20 18.5523 20 18V9C20 8.44772 19.5523 8 19 8H18C17.4477 8 17 8.44772 17 9V15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {citations.length} {citations.length === 1 ? "Source" : "Sources"}{" "}
              Cited
            </CitationCount>
          )}

          {displayTags.length > 0 && (
            <TagsContainer>
              {displayTags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
              {hasMoreTags && (
                <Tag style={{ opacity: 0.6 }}>+{tags.length - 3} more</Tag>
              )}
            </TagsContainer>
          )}

          <ArticleFooter>
            <span>{publishedAt ? formatDate(publishedAt) : "Draft"}</span>
            {photoCredit && (
              <span style={{ textAlign: "right", flex: 1 }}>
                Photo: {photoCredit}
              </span>
            )}
          </ArticleFooter>
        </ArticleInfo>
      </ArticleLink>
    </Card>
  );
});

ArticleCard.displayName = "ArticleCard";

export default ArticleCard;
