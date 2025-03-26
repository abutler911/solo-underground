// client/src/components/ArticleDetail.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import api from "../utils/api";

// Removed BackButton and Header-related components since they're now in Layout

const ArticleWrapper = styled.article`
  max-width: 850px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const ArticleHeader = styled.div`
  padding: 3rem 0 1.5rem;
`;

const Category = styled.div`
  font-size: 0.9rem;
  color: #d0d0d0;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
`;

const Title = styled.h1`
  font-size: 2.75rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
`;

const CoverImageContainer = styled.div`
  width: 100%;
  margin: 0 -1.5rem 2rem;
  overflow: hidden;
  position: relative;

  @media (min-width: 768px) {
    height: 60vh;
    margin: 0 0 3rem;
  }
`;

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const Content = styled.div`
  padding: 0 0 4rem;
  line-height: 1.9;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);

  p {
    margin-bottom: 2rem;
  }

  h2,
  h3 {
    margin: 3rem 0 1.5rem;
    line-height: 1.3;
  }

  h2 {
    font-size: 1.9rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 2rem 0;
    border-radius: 4px;
  }

  blockquote {
    margin: 2rem 0;
    padding: 1.5rem 2rem;
    border-left: 4px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0 4px 4px 0;
    font-style: italic;
    color: #c0c0c0;
  }

  a {
    color: #a0a0ff;
    text-decoration: none;
    border-bottom: 1px dotted rgba(160, 160, 255, 0.5);
    transition: all 0.2s ease;

    &:hover {
      color: #c0c0ff;
      border-bottom: 1px solid rgba(192, 192, 255, 0.8);
    }
  }

  ul,
  ol {
    margin-bottom: 2rem;
    padding-left: 2rem;

    li {
      margin-bottom: 0.75rem;
    }
  }
`;

const PhotoCredit = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: #888;
  margin-top: -1.5rem;
  margin-bottom: 2rem;
  font-style: italic;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 3rem 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.08);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  color: white;
  font-size: 1.2rem;

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

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    color: #888;
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
      <ArticleHeader>
        {article.category && <Category>{article.category}</Category>}
        <Title>{article.title}</Title>
        <Meta>
          <span>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </Meta>
      </ArticleHeader>

      {article.coverImage && (
        <>
          <CoverImageContainer>
            <CoverImage src={article.coverImage} alt={article.title} />
          </CoverImageContainer>
          {article.photoCredit && (
            <PhotoCredit>Photo: {article.photoCredit}</PhotoCredit>
          )}
        </>
      )}

      <Content dangerouslySetInnerHTML={{ __html: article.content }} />

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
