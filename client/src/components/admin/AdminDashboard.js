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
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const AdminBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);

  svg {
    width: 12px;
    height: 12px;
    opacity: 0.6;
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
  font-size: 2.5rem;
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
`;

const AdminSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
`;

const AdminStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;

  @media (min-width: 768px) {
    margin-top: 0;
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
`;

const StatValue = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: ${(props) =>
      props.$primary
        ? "linear-gradient(135deg, rgba(80, 140, 190, 0.9) 0%, rgba(60, 110, 160, 1) 100%)"
        : "rgba(255, 255, 255, 0.2)"};
    transform: translateY(-2px);
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);

    svg {
      opacity: 1;
    }
  }
`;

const AdminTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 600px) {
    overflow-x: auto;
    padding-bottom: 1px;

    /* Hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
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
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: white;
    background: ${(props) =>
      props.$active ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)"};
  }
`;

// Table components
const ArticlesTable = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
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

  @media (max-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;

    div:last-child {
      display: none;
    }
  }
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

    div:last-child {
      display: none;
    }
  }
`;

const ArticleTitle = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 1rem;
`;

const Status = styled.span`
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) =>
    props.$published ? "rgba(46, 125, 50, 0.15)" : "rgba(249, 168, 37, 0.15)"};
  color: ${(props) => (props.$published ? "#4caf50" : "#ffc107")};
`;

const TableActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.85rem;
  transition: all 0.2s ease;

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
`;

const FloatingButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &.edit {
    background-color: rgba(46, 125, 50, 0.9);
  }

  &.delete {
    background-color: rgba(198, 40, 40, 0.9);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
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

// Button components for modals
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

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

      <ArticlesTable>
        <TableHeader>
          <div>Title</div>
          <div>Status</div>
          <div>Date</div>
          <div>Actions</div>
        </TableHeader>

        {filteredArticles().length > 0 ? (
          filteredArticles().map((article) => (
            <TableRow
              key={article._id}
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
      </ArticlesTable>

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
