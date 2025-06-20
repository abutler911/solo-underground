// client/src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminRequest } from "../../utils/api";
import EnhancedModal from "../common/EnhancedModal";

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
  }
`;

// Header components
const AdminHeader = styled.header`
  position: relative;
  margin-bottom: 3.5rem;
  padding-bottom: 2rem;

  &:before {
    content: "";
    position: absolute;
    top: -3rem;
    left: -2rem;
    right: -2rem;
    height: 240px;
    background: linear-gradient(
      135deg,
      rgba(45, 45, 45, 0.6) 0%,
      rgba(20, 20, 20, 0.8) 100%
    );
    border-radius: 0 0 30px 30px;
    z-index: -1;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;

    &:before {
      top: -2rem;
      left: -1rem;
      right: -1rem;
      height: 200px;
      border-radius: 0 0 20px 20px;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 2rem;
    padding-bottom: 1rem;

    &:before {
      top: -1rem;
      left: -0.75rem;
      right: -0.75rem;
      height: 160px;
      border-radius: 0 0 15px 15px;
    }
  }
`;

const HeaderInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const AdminBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  color: rgba(255, 255, 255, 0.6);

  svg {
    width: clamp(10px, 2vw, 12px);
    height: clamp(10px, 2vw, 12px);
    opacity: 0.6;
  }

  @media (max-width: 480px) {
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }
`;

const BreadcrumbLink = styled(Link)`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`;

const AdminTitle = styled.h1`
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  font-weight: 700;
  margin: 0 0 0.75rem;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 1),
    rgba(210, 210, 210, 0.8)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: "Playfair Display", serif;
  line-height: 1.2;
  word-break: break-word;

  @media (max-width: 480px) {
    margin: 0 0 0.5rem;
  }
`;

const AdminSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  max-width: 600px;
  line-height: 1.6;
  margin: 0;

  @media (max-width: 480px) {
    line-height: 1.5;
  }
`;

const AdminStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    margin-top: 1.5rem;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  @media (max-width: 480px) {
    margin-top: 1rem;
    gap: 0.75rem;
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;

    &:hover {
      transform: none; /* Disable hover transform on mobile for better touch experience */
    }
  }
`;

const StatValue = styled.span`
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.span`
  font-size: clamp(0.7rem, 2vw, 0.85rem);
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    letter-spacing: 0.3px;
  }
`;

const AdminControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-top: 2rem;

  @media (min-width: 768px) {
    margin-top: 0;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    margin-top: 1.5rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    margin-top: 1rem;
    gap: 0.5rem;
    width: 100%;
  }
`;

const ActionButton = styled(Link)`
  background: ${(props) =>
    props.$primary
      ? "linear-gradient(135deg, rgba(70, 130, 180, 0.8) 0%, rgba(50, 100, 150, 0.9) 100%)"
      : "rgba(255, 255, 255, 0.1)"};
  color: white;
  padding: ${(props) =>
    props.$primary ? "0.85rem 1.75rem" : "0.75rem 1.5rem"};
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$primary ? "0 4px 12px rgba(70, 130, 180, 0.3)" : "none"};
  font-size: clamp(0.8rem, 2.2vw, 0.9rem);
  min-height: 44px; /* Touch target size */
  justify-content: center;

  svg {
    width: clamp(16px, 3vw, 18px);
    height: clamp(16px, 3vw, 18px);
  }

  &:hover {
    background: ${(props) =>
      props.$primary
        ? "linear-gradient(135deg, rgba(80, 140, 190, 0.9) 0%, rgba(60, 110, 160, 1) 100%)"
        : "rgba(255, 255, 255, 0.2)"};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1rem;
    border-radius: 6px;
    flex: 1;
    min-width: 120px;

    &:hover {
      transform: none; /* Disable hover transform on mobile */
    }
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: clamp(0.8rem, 2.2vw, 0.9rem);
  transition: all 0.2s ease;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  justify-content: center;

  svg {
    width: clamp(14px, 2.5vw, 16px);
    height: clamp(14px, 2.5vw, 16px);
    opacity: 0.7;
  }

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);

    svg {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    gap: 0.4rem;
  }

  @media (max-width: 480px) {
    padding: 0.8rem 0.9rem;
    border-radius: 6px;
    flex: 1;
    min-width: 100px;
  }
`;

const AdminTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    margin-top: 1.5rem;
    overflow-x: auto;
    padding-bottom: 1px;
    gap: 0.25rem;

    /* Hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  @media (max-width: 480px) {
    margin-top: 1rem;
  }
`;

const TabItem = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.1)" : "transparent"};
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.6)")};
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.$active ? "white" : "transparent")};
  font-size: clamp(0.8rem, 2.2vw, 0.95rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 44px;
  display: flex;
  align-items: center;

  &:hover {
    color: white;
    background: ${(props) =>
      props.$active ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)"};
  }

  @media (max-width: 768px) {
    padding: 0.7rem 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
  }
`;

// Mobile-first table design
const ArticlesTableContainer = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    border-radius: 6px;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 1.25rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: clamp(0.8rem, 2.2vw, 0.9rem);

  @media (max-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
    padding: 1rem 1.25rem;

    div:last-child {
      display: none;
    }
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr auto;
    padding: 0.75rem 1rem;

    div:nth-child(2),
    div:nth-child(3) {
      display: none;
    }
  }
`;

// Mobile-optimized card layout for small screens
const MobileArticleCard = styled.div`
  display: none;

  @media (max-width: 480px) {
    display: block;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const MobileCardTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.3;
  flex: 1;
`;

const MobileCardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  align-items: center;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }

  @media (max-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
    padding: 1rem 1.25rem;

    div:last-child {
      display: none;
    }
  }

  @media (max-width: 480px) {
    display: none; /* Hide on mobile, use card layout instead */
  }
`;

const ArticleTitle = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 1rem;
  font-size: clamp(0.85rem, 2vw, 0.95rem);

  @media (max-width: 768px) {
    padding-right: 0.75rem;
  }
`;

const Status = styled.span`
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: clamp(0.7rem, 1.8vw, 0.75rem);
  font-weight: 600;
  background-color: ${(props) =>
    props.$published ? "rgba(46, 125, 50, 0.15)" : "rgba(249, 168, 37, 0.15)"};
  color: ${(props) => (props.$published ? "#4caf50" : "#ffc107")};
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 0.25rem 0.6rem;
    font-size: 0.7rem;
  }
`;

const TableActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  transition: all 0.2s ease;
  min-height: 36px;
  min-width: 44px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &.edit {
    background-color: rgba(46, 125, 50, 0.2);

    &:hover {
      background-color: rgba(46, 125, 50, 0.3);
    }
  }

  &.delete {
    background-color: rgba(198, 40, 40, 0.2);

    &:hover {
      background-color: rgba(198, 40, 40, 0.3);
    }
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.6rem;
    margin-right: 0.4rem;
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    margin-right: 0.3rem;
    border-radius: 6px;
    flex: 1;
  }
`;

const MobileActions = styled.div`
  display: none;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 10;
  }

  @media (max-width: 480px) {
    bottom: 1.5rem;
    right: 1rem;
  }
`;

const FloatingButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &.edit {
    background-color: rgba(46, 125, 50, 0.9);
  }

  &.delete {
    background-color: rgba(198, 40, 40, 0.9);
  }

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    font-size: 1.3rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  min-height: 300px;

  @media (max-width: 480px) {
    min-height: 200px;
  }
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

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    border-width: 2px;
  }
`;

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  font-size: clamp(0.9rem, 2.5vw, 1rem);

  @media (max-width: 768px) {
    padding: 2rem 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
  }
`;

// Button components for modals
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(0.8rem, 2.2vw, 0.9rem);
  min-height: 44px;

  &.primary {
    background: linear-gradient(
      135deg,
      rgba(70, 130, 180, 0.8) 0%,
      rgba(50, 100, 150, 0.9) 100%
    );
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &.danger {
    background: rgba(220, 53, 69, 0.15);
    color: rgba(255, 150, 150, 1);
    border: 1px solid rgba(220, 53, 69, 0.2);
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1.25rem;
    border-radius: 8px;
  }
`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // New state variables for the redesigned header
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    published: 0,
    drafts: 0,
    total: 0,
  });

  // Only fetch articles once when the component mounts
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        // Make a single request to fetch all articles
        const res = await adminRequest("get", "/api/admin/articles");

        // Set articles and update loading state
        setArticles(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching articles", err);

        // Handle error cases
        if (err.response && err.response.status === 401) {
          setErrorMessage("Your session has expired. Please log in again.");
          setShowErrorModal(true);
        } else {
          setErrorMessage("Failed to load articles. Please try again.");
          setShowErrorModal(true);
        }

        setLoading(false);
      }
    };

    fetchArticles();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means this runs once on mount

  // Calculate stats when articles load
  useEffect(() => {
    if (!loading && articles.length > 0) {
      const published = articles.filter((article) => article.published).length;
      const drafts = articles.filter((article) => !article.published).length;

      setStats({
        published,
        drafts,
        total: articles.length,
      });
    }
  }, [articles, loading]);

  // Filter articles based on active tab
  const filteredArticles = () => {
    switch (activeTab) {
      case "published":
        return articles.filter((article) => article.published);
      case "drafts":
        return articles.filter((article) => !article.published);
      default:
        return articles;
    }
  };

  const initiateDelete = (id, e) => {
    if (e) e.stopPropagation(); // Prevent row selection
    setArticleToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      await adminRequest("delete", `/api/admin/articles/${articleToDelete}`);

      // Update local state to remove the deleted article
      setArticles(
        articles.filter((article) => article._id !== articleToDelete)
      );
      setShowDeleteModal(false);

      // Show success message
      setSuccessMessage("Article deleted successfully");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error deleting article", err);

      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        setErrorMessage("Your session has expired. Please log in again.");
        setShowErrorModal(true);
      } else {
        setErrorMessage("Failed to delete article. Please try again.");
        setShowErrorModal(true);
      }
    }
  };

  const initiateLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout("admin");
    setShowLogoutModal(false);
    navigate("/admin/login");
  };

  // Handle modal close with error redirect
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    if (errorMessage.includes("session has expired")) {
      logout("admin");
      navigate("/admin/login");
    }
  };

  // Mobile card component for articles
  const MobileArticleItem = ({ article }) => (
    <MobileArticleCard onClick={() => setSelectedArticle(article._id)}>
      <MobileCardHeader>
        <MobileCardTitle>{article.title}</MobileCardTitle>
        <Status $published={article.published}>
          {article.published ? "Published" : "Draft"}
        </Status>
      </MobileCardHeader>
      <MobileCardMeta>
        <div>{new Date(article.updatedAt).toLocaleDateString()}</div>
      </MobileCardMeta>
      <MobileCardActions>
        <TableActionButton
          className="edit"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/edit/${article._id}`);
          }}
        >
          Edit
        </TableActionButton>
        <TableActionButton
          className="delete"
          onClick={(e) => {
            e.stopPropagation();
            initiateDelete(article._id, e);
          }}
        >
          Delete
        </TableActionButton>
      </MobileCardActions>
    </MobileArticleCard>
  );

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingIndicator />
      </LoadingContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Redesigned Header */}
      <AdminHeader>
        <HeaderInner>
          <HeaderContent>
            <AdminBreadcrumb>
              <BreadcrumbLink to="/">Home</BreadcrumbLink>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Admin</span>
            </AdminBreadcrumb>

            <AdminTitle>Content Management</AdminTitle>
            <AdminSubtitle>
              Manage your articles, track performance, and create new content
              for your readers.
            </AdminSubtitle>

            <AdminStats>
              <StatCard>
                <StatValue>{stats.total}</StatValue>
                <StatLabel>Total Articles</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.published}</StatValue>
                <StatLabel>Published</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.drafts}</StatValue>
                <StatLabel>Drafts</StatLabel>
              </StatCard>
            </AdminStats>
          </HeaderContent>

          <AdminControls>
            <ActionButton to="/admin/create" $primary={true}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              New Article
            </ActionButton>
            <ActionButton to="/admin/staging">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 10H20M4 14H14M4 18H14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Staging Area
            </ActionButton>

            <LogoutButton onClick={initiateLogout}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17L21 12L16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </LogoutButton>
          </AdminControls>
        </HeaderInner>

        <AdminTabs>
          <TabItem
            $active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            All Articles
          </TabItem>
          <TabItem
            $active={activeTab === "published"}
            onClick={() => setActiveTab("published")}
          >
            Published
          </TabItem>
          <TabItem
            $active={activeTab === "drafts"}
            onClick={() => setActiveTab("drafts")}
          >
            Drafts
          </TabItem>
        </AdminTabs>
      </AdminHeader>

      <ArticlesTableContainer>
        <TableHeader>
          <div>Title</div>
          <div>Status</div>
          <div>Date</div>
          <div>Actions</div>
        </TableHeader>

        {filteredArticles().length > 0 ? (
          filteredArticles().map((article) => (
            <div key={article._id}>
              {/* Desktop/Tablet Table Row */}
              <TableRow
                onClick={() => setSelectedArticle(article._id)}
                style={{ cursor: "pointer" }}
              >
                <ArticleTitle>{article.title}</ArticleTitle>
                <div>
                  <Status $published={article.published}>
                    {article.published ? "Published" : "Draft"}
                  </Status>
                </div>
                <div>{new Date(article.updatedAt).toLocaleDateString()}</div>
                <div onClick={(e) => e.stopPropagation()}>
                  <TableActionButton
                    className="edit"
                    onClick={() => navigate(`/admin/edit/${article._id}`)}
                  >
                    Edit
                  </TableActionButton>
                  <TableActionButton
                    className="delete"
                    onClick={(e) => initiateDelete(article._id, e)}
                  >
                    Delete
                  </TableActionButton>
                </div>
              </TableRow>

              {/* Mobile Card Layout */}
              <MobileArticleItem article={article} />
            </div>
          ))
        ) : (
          <EmptyState>
            {activeTab === "all"
              ? "No articles found. Create your first article to get started."
              : activeTab === "published"
              ? "No published articles found."
              : "No draft articles found."}
          </EmptyState>
        )}
      </ArticlesTableContainer>

      {/* Mobile action buttons */}
      {selectedArticle && (
        <MobileActions>
          <FloatingButton
            className="edit"
            onClick={() => navigate(`/admin/edit/${selectedArticle}`)}
          >
            ✎
          </FloatingButton>
          <FloatingButton
            className="delete"
            onClick={(e) => initiateDelete(selectedArticle, e)}
          >
            ×
          </FloatingButton>
        </MobileActions>
      )}

      {/* Delete Confirmation Modal */}
      <EnhancedModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Article"
        size="small"
        footer={
          <>
            <Button
              className="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button className="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        Are you sure you want to delete this article? This action cannot be
        undone.
      </EnhancedModal>

      {/* Logout Confirmation Modal */}
      <EnhancedModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout Confirmation"
        size="small"
        footer={
          <>
            <Button
              className="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button className="primary" onClick={confirmLogout}>
              Logout
            </Button>
          </>
        }
      >
        Are you sure you want to log out of the admin panel?
      </EnhancedModal>

      {/* Error Modal */}
      <EnhancedModal
        isOpen={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
        size="small"
        footer={
          <Button className="primary" onClick={handleErrorModalClose}>
            OK
          </Button>
        }
      >
        {errorMessage}
      </EnhancedModal>

      {/* Success Modal */}
      <EnhancedModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        size="small"
        footer={
          <Button
            className="primary"
            onClick={() => setShowSuccessModal(false)}
          >
            OK
          </Button>
        }
      >
        {successMessage}
      </EnhancedModal>
    </DashboardContainer>
  );
};

export default AdminDashboard;
