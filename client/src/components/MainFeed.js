// client/src/components/MainFeed.js
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import styled from "styled-components";

import ArticleCard from "./ArticleCard";
import api from "../utils/api";

// Constants moved outside component to prevent recreation
const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "politics", name: "Politics" },
  { id: "finance", name: "Finance" },
  { id: "editorial", name: "Editorial" },
  { id: "technology", name: "Technology" },
  { id: "lifestyle", name: "Lifestyle" },
];

const MAX_WIDTH = "850px";

// Utility function moved outside component
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning.";
  if (hour < 18) return "Good Afternoon.";
  return "Good Evening.";
};

// Styled components remain the same but with constants
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
  transform: rotate(-4deg);
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    font-size: 3.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2.8rem;
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
  max-width: ${MAX_WIDTH};
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
  max-width: ${MAX_WIDTH};
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

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

// Memoized components for better performance
const CategoryNavigation = memo(({ activeCategory, onCategoryChange }) => (
  <CategoryNav>
    {CATEGORIES.map((category) => (
      <CategoryButton
        key={category.id}
        $active={activeCategory === category.id}
        onClick={() => onCategoryChange(category.id)}
      >
        {category.name}
      </CategoryButton>
    ))}
  </CategoryNav>
));

const ArticlesList = memo(({ articles, loading }) => {
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingIndicator />
      </LoadingContainer>
    );
  }

  if (articles.length === 0) {
    return (
      <EmptyState>
        No articles found. Check back soon for new content.
      </EmptyState>
    );
  }

  return articles.map((article) => (
    <ArticleCard key={article._id} article={article} />
  ));
});

const Greeting = memo(() => {
  // Memoize the greeting text since it only changes based on time of day
  const greeting = useMemo(() => getTimeOfDay(), []);

  return (
    <GreetingContainer>
      <GreetingBackground />
      <GreetingText>{greeting}</GreetingText>
      <GreetingLine />
    </GreetingContainer>
  );
});

const MainFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Memoized API call to prevent unnecessary re-creation
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/articles");
      setArticles(res.data);
    } catch (err) {
      console.error("Error fetching articles", err);
      setError("Failed to load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [fetchArticles]);

  // Memoized filtered articles with dependency array
  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") return articles;
    return articles.filter(
      (article) => article.category?.toLowerCase() === activeCategory
    );
  }, [articles, activeCategory]);

  // Memoized section title
  const sectionTitle = useMemo(() => {
    if (activeCategory === "all") {
      return "Featured Stories";
    }
    const category = CATEGORIES.find((c) => c.id === activeCategory);
    return `${category?.name || "Unknown"} Stories`;
  }, [activeCategory]);

  // Memoized category change handler
  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  // Error state
  if (error) {
    return (
      <FeedContainer>
        <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
          {error}
          <button onClick={fetchArticles} style={{ marginLeft: "1rem" }}>
            Retry
          </button>
        </div>
      </FeedContainer>
    );
  }

  return (
    <FeedContainer>
      <Greeting />

      <CategoryNavigation
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <SectionTitle>
        <FeaturedIcon>✦</FeaturedIcon>
        {sectionTitle}
      </SectionTitle>

      <ArticlesContainer>
        <ArticlesList articles={filteredArticles} loading={loading} />
      </ArticlesContainer>
    </FeedContainer>
  );
};

export default MainFeed;
