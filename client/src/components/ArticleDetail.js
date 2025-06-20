// client/src/components/ArticleDetail.js
import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../utils/api";
import FeaturedQuote from "./FeaturedQuote";

const ArticleWrapper = styled.article`
  max-width: 740px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  font-family: "PT Serif", Georgia, serif;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 1rem 3rem;
  }

  @media (max-width: 480px) {
    padding: 0 0.75rem 2rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-family: "Libre Franklin", sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 2rem;
  margin-bottom: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
    transform: translateX(-2px);
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    margin-top: 1rem;
  }
`;

const ArticleCategory = styled.div`
  font-family: "Libre Franklin", sans-serif;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  text-transform: uppercase;
  letter-spacing: clamp(0.03rem, 0.1vw, 0.05rem);
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: #d72c2c;
  font-weight: 700;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(to right, #d72c2c, transparent);
  }

  @media (max-width: 768px) {
    margin-top: 2rem;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 480px) {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const ArticleTitle = styled.h1`
  font-family: "Merriweather", Georgia, serif;
  font-size: clamp(2rem, 6vw, 3.2rem);
  line-height: 1.2;
  font-weight: 700;
  margin: 0 0 1.25rem;
  letter-spacing: -0.01rem;
  color: #ffffff;
  word-break: break-word;
  hyphens: auto;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
    line-height: 1.15;
  }

  @media (max-width: 480px) {
    margin-bottom: 0.75rem;
    line-height: 1.1;
  }
`;

const ArticleSubtitle = styled.div`
  font-family: "PT Serif", Georgia, serif;
  font-size: clamp(0.95rem, 2.5vw, 1.1rem);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  padding-left: 1rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: -3px;
    top: 0;
    width: 3px;
    height: 30%;
    background: #d72c2c;
  }

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
    padding-left: 0.75rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1rem;
    padding-left: 0.6rem;
    line-height: 1.4;
  }
`;

const ArticleByline = styled.div`
  font-family: "Libre Franklin", sans-serif;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.2vw, 0.95rem);
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "✦";
    color: #d72c2c;
    font-size: 0.8em;
  }

  @media (max-width: 480px) {
    margin: 1rem 0;
  }
`;

const CoverImageContainer = styled.div`
  margin: 2rem 0 1.5rem;
  width: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    margin: 1.5rem 0 1.25rem;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    margin: 1rem 0;
    border-radius: 4px;
  }
`;

const CoverImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 480px) {
    &:hover {
      transform: none;
    }
  }
`;

const ImageCaption = styled.div`
  font-family: "Libre Franklin", sans-serif;
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  line-height: 1.5;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: left;
  font-style: italic;

  &::before {
    content: "📷 ";
    opacity: 0.6;
  }
`;

const ArticleMeta = styled.div`
  font-family: "Libre Franklin", sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0;
  padding: 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: clamp(0.8rem, 2vw, 0.85rem);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  padding-left: 1rem;
  padding-right: 1rem;

  @media (max-width: 768px) {
    margin: 1.5rem 0;
    padding: 1.25rem 0.75rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
    padding: 1rem 0.5rem;
    text-align: center;
  }
`;

const ArticleDate = styled.div`
  text-transform: uppercase;
  letter-spacing: clamp(0.03rem, 0.1vw, 0.05rem);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "📅";
    opacity: 0.7;
    font-size: 0.9em;
  }
`;

const ShareTools = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const ShareButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: clamp(0.75rem, 1.8vw, 0.85rem);
  font-family: "Libre Franklin", sans-serif;
  letter-spacing: 0.05rem;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 600;
  min-height: 40px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;

    &:hover {
      transform: none;
    }
  }
`;

const ReadingProgress = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${(props) => props.$progress}%;
  height: 3px;
  background: linear-gradient(to right, #d72c2c, #ff6b6b);
  z-index: 100;
  transition: width 0.1s ease;

  @media (max-width: 480px) {
    height: 2px;
  }
`;

const Content = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  line-height: 1.85;
  font-family: "PT Serif", Georgia, serif;
  position: relative;

  &:after {
    content: "";
    display: table;
    clear: both;
  }

  p {
    margin-bottom: 1.75rem;

    @media (max-width: 768px) {
      margin-bottom: 1.5rem;
    }

    @media (max-width: 480px) {
      margin-bottom: 1.25rem;
    }
  }

  p:first-of-type:first-letter {
    float: left;
    font-size: clamp(2.5rem, 8vw, 3.5rem);
    line-height: 1;
    padding-right: clamp(0.5rem, 2vw, 0.8rem);
    padding-top: clamp(0.2rem, 1vw, 0.4rem);
    font-weight: 700;
    color: #d72c2c;

    @media (max-width: 480px) {
      padding-right: 0.4rem;
      padding-top: 0.1rem;
    }
  }

  h2,
  h3 {
    font-family: "Merriweather", Georgia, serif;
    font-weight: 700;
    margin: 2.5rem 0 1.25rem;
    clear: both;
    color: rgba(255, 255, 255, 0.95);

    @media (max-width: 768px) {
      margin: 2rem 0 1rem;
    }

    @media (max-width: 480px) {
      margin: 1.5rem 0 0.75rem;
    }
  }

  h2 {
    font-size: clamp(1.3rem, 4vw, 1.6rem);
    position: relative;
    padding-bottom: 0.5rem;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(to right, #d72c2c, transparent);
    }
  }

  h3 {
    font-size: clamp(1.2rem, 3.5vw, 1.4rem);
  }

  blockquote {
    margin: 2rem 0;
    padding: 1.5rem;
    border-left: 4px solid #d72c2c;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    font-size: clamp(1.05rem, 2.8vw, 1.2rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
    position: relative;

    &::before {
      content: '"';
      position: absolute;
      top: -10px;
      left: 20px;
      font-size: 3rem;
      color: #d72c2c;
      opacity: 0.3;
      font-family: Georgia, serif;
    }

    @media (max-width: 768px) {
      margin: 1.5rem 0;
      padding: 1.25rem;
    }

    @media (max-width: 480px) {
      margin: 1rem 0;
      padding: 1rem;
      border-radius: 0 6px 6px 0;
    }
  }

  a {
    color: #4e95cb;
    text-decoration: none;
    border-bottom: 1px solid rgba(78, 149, 203, 0.3);
    transition: all 0.2s ease;
    padding: 0 2px;

    &:hover {
      border-bottom-color: #4e95cb;
      background: rgba(78, 149, 203, 0.1);
    }

    &:focus {
      outline: 2px solid rgba(78, 149, 203, 0.5);
      outline-offset: 2px;
    }
  }

  strong {
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.85);
  }

  ul,
  ol {
    margin: 0 0 1.75rem 1.5rem;

    @media (max-width: 768px) {
      margin: 0 0 1.5rem 1.25rem;
    }

    @media (max-width: 480px) {
      margin: 0 0 1.25rem 1rem;
    }

    li {
      margin-bottom: 0.75rem;
      line-height: 1.7;

      @media (max-width: 480px) {
        margin-bottom: 0.5rem;
      }
    }
  }

  ul li {
    position: relative;

    &::before {
      content: "•";
      color: #d72c2c;
      font-size: 1.2em;
      position: absolute;
      left: -1.2em;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 2rem 0;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    @media (max-width: 768px) {
      margin: 1.5rem 0;
      border-radius: 6px;
    }

    @media (max-width: 480px) {
      margin: 1rem 0;
      border-radius: 4px;
    }
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 3rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-family: "Libre Franklin", sans-serif;

  @media (max-width: 768px) {
    margin: 2rem 0 0;
    padding-top: 1.25rem;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    margin: 1.5rem 0 0;
    padding-top: 1rem;
    gap: 0.4rem;
  }
`;

const Tag = styled.span`
  padding: 0.4rem 0.75rem;
  border-radius: 2rem;
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 32px;
  display: flex;
  align-items: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
    color: white;
  }

  @media (max-width: 480px) {
    padding: 0.35rem 0.6rem;
    border-radius: 1.5rem;

    &:hover {
      transform: none;
    }
  }
`;

const CitationsContainer = styled.div`
  margin: 3rem 0 0;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  font-family: "Libre Franklin", sans-serif;

  @media (max-width: 768px) {
    margin: 2rem 0 0;
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    margin: 1.5rem 0 0;
    padding: 1rem;
    border-radius: 6px;
  }
`;

const CitationsTitle = styled.h3`
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  margin-bottom: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "📚";
    font-size: 0.9em;
  }
`;

const CitationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const CitationItem = styled.a`
  text-decoration: none;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  display: block;
  position: relative;
  padding-right: 2rem;

  &::after {
    content: "↗";
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.6;
    transition: all 0.2s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);

    &::after {
      opacity: 1;
      transform: translateY(-50%) translateX(2px);
    }
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    padding: 0.6rem;
    padding-right: 1.5rem;
    border-radius: 4px;

    &:hover {
      transform: none;

      &::after {
        transform: translateY(-50%);
      }
    }
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  color: white;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-family: "Libre Franklin", sans-serif;
  flex-direction: column;
  gap: 1rem;

  &::after {
    content: "";
    width: 2rem;
    height: 2rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-left-color: white;
    border-radius: 50%;
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
  font-family: "Libre Franklin", sans-serif;
  padding: 2rem;

  h2 {
    font-size: clamp(1.5rem, 5vw, 2rem);
    margin-bottom: 1rem;
    color: white;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    max-width: 400px;
  }
`;

const ArticleDetail = memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  // Calculate reading progress
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", updateReadingProgress);
    return () => window.removeEventListener("scroll", updateReadingProgress);
  }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "long" }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${month} ${day}, ${year}, ${formattedHours}:${minutes} ${ampm} ET`;
  }, []);

  const renderContentWithQuotes = useCallback(() => {
    if (!article) return null;

    if (!article.quotes || article.quotes.length === 0) {
      return <div dangerouslySetInnerHTML={{ __html: article.content }} />;
    }

    const paragraphs = article.content.split("<p>").filter(Boolean);
    const quotes = [...article.quotes];
    const quotePositions = [];
    const quotesCount = quotes.length;
    const paragraphsCount = paragraphs.length;
    const startParagraph = Math.min(2, Math.floor(paragraphsCount * 0.2));

    if (quotesCount > 0 && paragraphsCount > startParagraph) {
      const spacing = Math.floor(
        (paragraphsCount - startParagraph) / (quotesCount + 1)
      );

      for (let i = 0; i < quotesCount; i++) {
        const position = startParagraph + spacing * (i + 1);
        if (position < paragraphsCount) {
          quotePositions.push({ index: position, quote: quotes[i] });
        }
      }
    }

    return (
      <>
        {paragraphs.map((paragraph, index) => {
          const quoteAtPosition = quotePositions.find(
            (pos) => pos.index === index
          );

          return (
            <React.Fragment key={index}>
              <p dangerouslySetInnerHTML={{ __html: paragraph }} />
              {quoteAtPosition && (
                <FeaturedQuote quote={quoteAtPosition.quote} />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  }, [article]);

  if (loading) return <Loading>Loading article</Loading>;

  if (!article) {
    return (
      <ArticleNotFound>
        <h2>Article Not Found</h2>
        <p>We couldn't find the article you're looking for.</p>
        <BackButton onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Go Back
        </BackButton>
      </ArticleNotFound>
    );
  }

  return (
    <>
      <ReadingProgress $progress={readingProgress} />
      <ArticleWrapper>
        <BackButton onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </BackButton>

        {article.category && (
          <ArticleCategory>{article.category}</ArticleCategory>
        )}

        <ArticleTitle>{article.title}</ArticleTitle>

        {article.summary && (
          <ArticleSubtitle>{article.summary}</ArticleSubtitle>
        )}

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
            <ShareButton>Share</ShareButton>
          </ShareTools>
        </ArticleMeta>

        <Content>{renderContentWithQuotes()}</Content>

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
    </>
  );
});

ArticleDetail.displayName = "ArticleDetail";

export default ArticleDetail;
