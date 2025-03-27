// client/src/components/ArticleCard.js
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Card = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
`;

const ArticleLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const ArticleImage = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  position: relative;
  overflow: hidden;
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
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
`;

const ArticleInfo = styled.div`
  padding: 1.5rem 1.5rem 2rem;
`;

const ArticleCategory = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ArticleTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5rem 0 1rem;
  line-height: 1.3;
  letter-spacing: -0.5px;
`;

const ArticleMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

const Author = styled.span`
  font-weight: 500;
`;

const ArticleSummary = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
`;

const ArticleFooter = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  margin-top: 1rem;
`;

const ReadMore = styled.span`
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  position: relative;
  &:after {
    content: "";
    position: absolute;
    bottom: -3px;
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
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 0.3rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 2rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
`;

// New component for citation count indicator
const CitationCount = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ArticleCard = ({ article }) => {
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

  const formatDate = (dateString) => {
    const options = { month: "long", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <Card>
      <ArticleLink to={`/article/${_id}`}>
        {coverImage && (
          <ArticleImage>
            <img src={coverImage} alt={title} />
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

          <ArticleFooter>
            <span>{publishedAt ? formatDate(publishedAt) : "Draft"}</span>
            {photoCredit && <span>Photo: {photoCredit}</span>}
          </ArticleFooter>

          {citations && citations.length > 0 && (
            <CitationCount>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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

          {tags && tags.length > 0 && (
            <TagsContainer>
              {tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </TagsContainer>
          )}
        </ArticleInfo>
      </ArticleLink>
    </Card>
  );
};

export default ArticleCard;
