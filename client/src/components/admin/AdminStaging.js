import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { adminRequest } from "../../utils/api";
import EnhancedModal from "../common/EnhancedModal";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: white;
`;

const ArticleCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1.5rem;
  color: white;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const MetaRow = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

const ActionRow = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  &.publish {
    background: rgba(46, 125, 50, 0.8);
    color: white;

    &:hover {
      background: rgba(46, 125, 50, 1);
    }
  }

  &.rewrite {
    background: rgba(255, 193, 7, 0.8);
    color: black;

    &:hover {
      background: rgba(255, 193, 7, 1);
    }
  }

  &.edit {
    background: rgba(70, 130, 180, 0.7);
    color: white;

    &:hover {
      background: rgba(70, 130, 180, 0.9);
    }
  }

  &.delete {
    background: rgba(198, 40, 40, 0.8);
    color: white;

    &:hover {
      background: rgba(198, 40, 40, 1);
    }
  }
`;

const EmptyState = styled.div`
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: 4rem;
  font-style: italic;
`;

const AdminStaging = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const fetchDrafts = async () => {
    try {
      const res = await adminRequest("get", "/api/admin/staging");
      setDrafts(res.data);
    } catch (err) {
      console.error("Error fetching drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const updateStatus = async (id, endpoint) => {
    try {
      await adminRequest("put", `/api/admin/articles/${id}/${endpoint}`);
      fetchDrafts();
    } catch (err) {
      console.error(`Failed to update article (${endpoint})`, err);
    }
  };

  const confirmDelete = async () => {
    try {
      await adminRequest("delete", `/api/admin/articles/${deleteId}`);
      fetchDrafts();
    } catch (err) {
      console.error("Failed to delete article", err);
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  if (loading) return <Container>Loading drafts...</Container>;

  return (
    <Container>
      <PageTitle>Staging Area: Draft Articles</PageTitle>

      {drafts.length === 0 ? (
        <EmptyState>No draft articles found.</EmptyState>
      ) : (
        drafts.map((article) => (
          <ArticleCard key={article._id}>
            <h2>{article.title}</h2>
            <MetaRow>
              <span>Author: {article.author || article.reporter}</span>
              <span>Topic: {article.topic || "Uncategorized"}</span>
              <span>
                Submitted: {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </MetaRow>
            <ActionRow>
              <Button
                className="publish"
                onClick={() => updateStatus(article._id, "publish")}
              >
                Publish
              </Button>
              <Button
                className="rewrite"
                onClick={() => updateStatus(article._id, "needs-rewrite")}
              >
                Needs Rewrite
              </Button>
              <Button
                className="edit"
                onClick={() => navigate(`/admin/edit/${article._id}`)}
              >
                Edit
              </Button>
              <Button
                className="delete"
                onClick={() => {
                  setDeleteId(article._id);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </Button>
            </ActionRow>
          </ArticleCard>
        ))
      )}

      <EnhancedModal
        isOpen={showDeleteModal}
        title="Delete Draft"
        onClose={() => setShowDeleteModal(false)}
        size="small"
        footer={
          <>
            <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button className="delete" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </>
        }
      >
        Are you sure you want to delete this draft article?
      </EnhancedModal>
    </Container>
  );
};

export default AdminStaging;
