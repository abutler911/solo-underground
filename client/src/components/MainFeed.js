// client/src/components/MainFeed.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ArticleCard from "./ArticleCard";
import api from "../utils/api";

// Removed Header and Navigation components as they're now in the Layout
const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 3rem;
`;

const GreetingContainer = styled.div`
  padding: 3rem 1.5rem 2.5rem;
  position: relative;
  overflow: hidden;
`;

const GreetingText = styled.h2`
  font-size: 4.5rem;
  font-weight: 400;
  font-family: "Fredericka the Great", serif;
  color: #f5d442;
  margin: 0;
  line-height: 1.1;
  transform: rotate(-2deg);
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.6);

  /* Responsive font sizes */
  @media (max-width: 768px) {
    font-size: 3.5rem; /* Increased from 2.5rem */
  }

  @media (max-width: 480px) {
    font-size: 2.8rem; /* Added a smaller breakpoint */
  }
`;

const GreetingLine = styled.div`
  width: 60%;
  height: 2px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.6), transparent);
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
`;

const GreetingBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
  z-index: -1;
`;

const SectionTitle = styled.div`
  padding: 1.75rem 1.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: linear-gradient(to right, #ffffff, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FeaturedIcon = styled.span`
  font-size: 1.25rem;
  filter: grayscale(0.5) brightness(0.8);
`;

const ArticlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 850px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1.5rem;
`;

const LoadingContainer = styled.div`
  padding: 3rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const LoadingIndicator = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
`;

const CategoryNav = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1.5rem 2rem;
  margin: 0 auto;
  max-width: 850px;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryButton = styled.button`
  background: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"};
  color: ${(props) => (props.$active ? "#ffffff" : "rgba(255, 255, 255, 0.7)")};
  border: none;
  border-radius: 2rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
`;

const MainFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All" },
    { id: "politics", name: "Politics" },
    { id: "finance", name: "Finance" },
    { id: "editorial", name: "Editorial" },
    { id: "technology", name: "Technology" },
    { id: "lifestyle", name: "Lifestyle" },
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get("/api/articles");
        setArticles(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching articles", err);
        setLoading(false);
      }
    };
    fetchArticles();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning.";
    if (hour < 18) return "Good Afternoon.";
    return "Good Evening.";
  };

  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter(
          (article) => article.category?.toLowerCase() === activeCategory
        );

  return (
    <FeedContainer>
      <GreetingContainer>
        <GreetingBackground />
        <GreetingText>{getTimeOfDay()}</GreetingText>
        <GreetingLine />
      </GreetingContainer>

      <CategoryNav>
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            $active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </CategoryButton>
        ))}
      </CategoryNav>

      <SectionTitle>
        <FeaturedIcon>✦</FeaturedIcon>
        {activeCategory === "all"
          ? "Featured Stories"
          : `${categories.find((c) => c.id === activeCategory)?.name} Stories`}
      </SectionTitle>

      <ArticlesContainer>
        {loading ? (
          <LoadingContainer>
            <LoadingIndicator />
          </LoadingContainer>
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))
        ) : (
          <EmptyState>
            No articles found. Check back soon for new content.
          </EmptyState>
        )}
      </ArticlesContainer>
    </FeedContainer>
  );
};

export default MainFeed;
