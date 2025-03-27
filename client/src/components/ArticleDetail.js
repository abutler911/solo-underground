// client/src/components/ArticleDetail.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import api from "../utils/api";

// Global style for importing fonts - add this to index.html instead
// <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet">

const ArticleWrapper = styled.article`
  max-width: 740px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  font-family: "Libre Baskerville", Georgia, serif;
`;

const ArticleCategory = styled.div`
  font-family: "Source Sans Pro", sans-serif;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: #d72c2c; /* Atlantic-style red for category */
  font-weight: 700;
`;

const ArticleTitle = styled.h1`
  font-size: 2.6rem;
  line-height: 1.2;
  font-weight: 700;
  margin: 0 0 1.25rem;
  letter-spacing: -0.01rem;
  color: #ffffff;

  @media (min-width: 768px) {
    font-size: 3.2rem;
  }
`;

const ArticleSubtitle = styled.div`
  font-family: "Libre Baskerville", Georgia, serif;
  font-size: 1rem; /* Reduced from 1.25rem */
  line-height: 1.5;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  padding-left: 1rem;
`;

const ArticleByline = styled.div`
  font-family: "Source Sans Pro", sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.8);
`;

const CoverImageContainer = styled.div`
  margin: 2rem 0 1.5rem;
  width: 100%;
  position: relative;
`;

const CoverImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const ImageCaption = styled.div`
  font-family: "Source Sans Pro", sans-serif;
  font-size: 0.8rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: left;
`;

const ArticleMeta = styled.div`
  font-family: "Source Sans Pro", sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const ArticleDate = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.05rem;
`;

const ShareTools = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.85rem;
  font-family: "Source Sans Pro", sans-serif;
  letter-spacing: 0.05rem;
  text-transform: uppercase;
  padding: 0;

  &:hover {
    color: #ffffff;
  }
`;

const Content = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.8;

  p {
    margin-bottom: 1.75rem;
  }

  p:first-of-type:first-letter {
    float: left;
    font-size: 3.5rem;
    line-height: 1;
    padding-right: 0.8rem;
    padding-top: 0.4rem;
  }

  h2,
  h3 {
    font-family: "Source Sans Pro", sans-serif;
    font-weight: 700;
    margin: 2.5rem 0 1.25rem;
  }

  h2 {
    font-size: 1.6rem;
  }

  h3 {
    font-size: 1.4rem;
  }

  blockquote {
    margin: 2rem 0;
    padding: 0.5rem 0 0.5rem 1.5rem;
    border-left: 3px solid rgba(255, 255, 255, 0.4);
    font-style: italic;
    font-size: 1.2rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
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

  strong {
    font-weight: 700;
  }

  em {
    font-style: italic;
  }

  ul,
  ol {
    margin: 0 0 1.75rem 1.5rem;

    li {
      margin-bottom: 0.75rem;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 2rem 0;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 3rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-family: "Source Sans Pro", sans-serif;
`;

const Tag = styled.span`
  padding: 0.4rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

// New component for citations
const CitationsContainer = styled.div`
  margin: 3rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-family: "Source Sans Pro", sans-serif;
`;

const CitationsTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const CitationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CitationItem = styled.a`
  text-decoration: none;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  color: white;
  font-size: 1.2rem;
  font-family: "Source Sans Pro", sans-serif;

  &:after {
    content: "";
    width: 2rem;
    height: 2rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-left-color: white;
    border-radius: 50%;
    margin-left: 1rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ArticleNotFound = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
  font-family: "Source Sans Pro", sans-serif;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
  }
`;

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await api.get(`/api/articles/${id}`);
        setArticle(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching article", err);
        setLoading(false);
      }
    };

    fetchArticle();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  // Format date in the style of "MARCH 26, 2025, 9:15 AM ET"
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    // Format month, day, year
    const month = date.toLocaleString("en-US", { month: "long" }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear();

    // Format time
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${month} ${day}, ${year}, ${formattedHours}:${minutes} ${ampm} ET`;
  };

  if (loading) return <Loading>Loading article</Loading>;

  if (!article) {
    return (
      <ArticleNotFound>
        <h2>Article Not Found</h2>
        <p>We couldn't find the article you're looking for.</p>
      </ArticleNotFound>
    );
  }

  return (
    <ArticleWrapper>
      {article.category && (
        <ArticleCategory>{article.category}</ArticleCategory>
      )}
      <ArticleTitle>{article.title}</ArticleTitle>

      {article.summary && <ArticleSubtitle>{article.summary}</ArticleSubtitle>}

      <ArticleByline>By {article.author || "Admin"}</ArticleByline>

      {article.coverImage && (
        <CoverImageContainer>
          <CoverImage src={article.coverImage} alt={article.title} />
          {article.photoCredit && (
            <ImageCaption>Photo: {article.photoCredit}</ImageCaption>
          )}
        </CoverImageContainer>
      )}

      <ArticleMeta>
        <ArticleDate>{formatDate(article.publishedAt)}</ArticleDate>
        <ShareTools>
          <ShareButton>SHARE</ShareButton>
        </ShareTools>
      </ArticleMeta>

      <Content dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* Citations Section */}
      {article.citations && article.citations.length > 0 && (
        <CitationsContainer>
          <CitationsTitle>Sources</CitationsTitle>
          <CitationsList>
            {article.citations.map((citation, index) => (
              <CitationItem
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {citation.title}
              </CitationItem>
            ))}
          </CitationsList>
        </CitationsContainer>
      )}

      {article.tags && article.tags.length > 0 && (
        <TagsContainer>
          {article.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
      )}
    </ArticleWrapper>
  );
};

export default ArticleDetail;
