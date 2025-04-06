// client/src/components/admin/ArticleEditor.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { api, articlesApi } from "../../utils/api";
import EnhancedModal from "../common/EnhancedModal";
import { useAuth } from "../../context/AuthContext";
import QuoteEditor from "./QuoteEditor";

const EditorContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const EditorHeader = styled.header`
  position: relative;
  margin-bottom: 2.5rem;

  &:before {
    content: "";
    position: absolute;
    top: -2rem;
    left: -2rem;
    right: -2rem;
    height: 180px;
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

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const EditorBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
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

const HeaderTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
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

const SubTitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin: 0;
  max-width: 600px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &[type="file"] {
    padding: 0.6rem 1rem;

    &::-webkit-file-upload-button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 4px;
      color: white;
      padding: 0.5rem 1rem;
      margin-right: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }

  option {
    background-color: #1a1a1a;
    color: white;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }
`;

const CustomQuill = styled.div`
  .quill {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .ql-toolbar {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 6px 6px 0 0;

      .ql-picker {
        color: rgba(255, 255, 255, 0.8);

        .ql-picker-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .ql-picker-options {
          background-color: #1a1a1a;
          border-color: rgba(255, 255, 255, 0.1);

          .ql-picker-item {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }

      button {
        color: rgba(255, 255, 255, 0.8);

        &:hover {
          color: white;
        }

        svg {
          stroke: currentColor;
          fill: none;
        }
      }
    }

    .ql-container {
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: 0 0 6px 6px;
      border: none;
      font-family: "Source Sans Pro", sans-serif;

      .ql-editor {
        min-height: 300px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 1rem;
        line-height: 1.6;

        &.ql-blank::before {
          color: rgba(255, 255, 255, 0.3);
        }

        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        li {
          color: rgba(255, 255, 255, 0.9);
        }

        blockquote {
          border-left-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.7);
        }

        a {
          color: #4e95cb;
          text-decoration: none;
        }
      }
    }
  }
`;

const InputNote = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0.25rem 0 0;
`;

const ImagePreviewContainer = styled.div`
  margin-top: 1rem;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background-color: rgba(0, 0, 0, 0.2);
  max-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
`;

const PhotoCreditDisplay = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
`;

const UploadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-top: 0.5rem;

  &:before {
    content: "";
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  svg {
    width: 18px;
    height: 18px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.primary {
    background: linear-gradient(
      135deg,
      rgba(70, 130, 180, 0.8) 0%,
      rgba(50, 100, 150, 0.9) 100%
    );
    color: white;
    box-shadow: 0 4px 12px rgba(70, 130, 180, 0.3);

    &:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(80, 140, 190, 0.9) 0%,
        rgba(60, 110, 160, 1) 100%
      );
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }
  }

  &.danger {
    background: rgba(220, 53, 69, 0.15);
    color: rgba(255, 150, 150, 1);
    border: 1px solid rgba(220, 53, 69, 0.2);

    &:hover:not(:disabled) {
      background: rgba(220, 53, 69, 0.25);
    }
  }
`;

const EditorSection = styled.div`
  margin-bottom: 2.5rem;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

// Citation components
const CitationsContainer = styled.div`
  margin-top: 1.5rem;
`;

const CitationItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const CitationInputs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CitationControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RemoveButton = styled.button`
  background: rgba(220, 53, 69, 0.1);
  border: none;
  color: rgba(255, 150, 150, 0.9);
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(220, 53, 69, 0.2);
  }
`;

const AddCitationButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${(props) => (props.$active ? "1" : "0")};
  visibility: ${(props) => (props.$active ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 8px;
  background-color: rgba(30, 30, 30, 0.9);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const LoadingSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 1rem;
  color: white;
  max-width: 300px;
  text-align: center;
`;

// Format helper function for inserting links in the editor
const formatLink = (url, text) => {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isEditing = !!id;

  // State for modal handling
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    summary: "",
    content: "",
    coverImage: "",
    photoCredit: "",
    tags: "",
    author: "",
  });
  const [quotes, setQuotes] = useState([]);
  // Array of citation objects
  const [citations, setCitations] = useState([{ title: "", url: "" }]);

  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [publishPending, setPublishPending] = useState(false);

  const categories = [
    "Politics",
    "Finance",
    "Editorial",
    "Technology",
    "Lifestyle",
  ];

  // Only fetch article data once on component mount if editing
  useEffect(() => {
    if (isEditing) {
      const fetchArticle = async () => {
        try {
          console.log(`Fetching article with ID: ${id}`);
          const res = await articlesApi.admin.getById(id);
          console.log("FULL RESPONSE:", res); // logs status, headers, etc.
          console.log("DATA SHAPE:", res.data); // logs the actual response body

          // Create a more explicit mapping to ensure all fields are correctly set
          const articleData = res.data;

          console.log("Parsed article data fields:", {
            title: articleData.title,
            category: articleData.category,
            tags: articleData.tags,
            author: articleData.author,
          });

          setFormData({
            title: articleData.title || "",
            category: articleData.category || "",
            summary: articleData.summary || "",
            content: articleData.content || "",
            coverImage: articleData.coverImage || "",
            photoCredit: articleData.photoCredit || "",
            tags: articleData.tags ? articleData.tags.join(", ") : "",
            author: articleData.author || "",
          });

          // Handle quotes and citations separately
          if (articleData.quotes && Array.isArray(articleData.quotes)) {
            console.log("Setting quotes:", articleData.quotes);
            setQuotes(articleData.quotes);
          } else {
            console.log("No quotes found, using empty array");
            setQuotes([]);
          }

          if (articleData.citations && Array.isArray(articleData.citations)) {
            console.log("Setting citations:", articleData.citations);
            setCitations(articleData.citations);
          } else {
            console.log("No citations found, using default");
            setCitations([{ title: "", url: "" }]);
          }
        } catch (err) {
          console.error("Error fetching article:", err);

          // Handle authentication errors
          if (err.response && err.response.status === 401) {
            setErrorMessage(
              "Your admin session has expired. Please log in again."
            );
            setShowErrorModal(true);
          } else {
            setErrorMessage(
              "Failed to load article: " +
                (err.response?.data?.message || "Unknown error")
            );
            setShowErrorModal(true);
          }
        }
      };

      fetchArticle();
    }

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  // Handle citation changes
  const handleCitationChange = (index, field, value) => {
    const updatedCitations = [...citations];
    updatedCitations[index][field] = value;
    setCitations(updatedCitations);
  };

  // Add a new citation
  const addCitation = () => {
    setCitations([...citations, { title: "", url: "" }]);
  };

  // Remove a citation
  const removeCitation = (index) => {
    if (citations.length > 1) {
      const updatedCitations = citations.filter((_, i) => i !== index);
      setCitations(updatedCitations);
    }
  };

  // Insert a citation link into the editor
  const insertCitationLink = (index) => {
    const citation = citations[index];
    if (!citation.title || !citation.url) return;

    // Create a formatted link
    const link = formatLink(citation.url, citation.title);

    // Get the current content
    const currentContent = formData.content;

    // Append the link to the end, or you could implement more complex insertion logic
    const updatedContent = currentContent + `<p>${link}</p>`;

    // Update the content
    setFormData({ ...formData, content: updatedContent });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);

    try {
      // Create FormData for the file
      const formDataObj = new FormData();
      formDataObj.append("image", file);

      // Send to server using our admin token handling
      const response = await api.post("/api/upload/image", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      // Check response and update the form
      if (response.data && response.data.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: response.data.url,
        }));
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setErrorMessage("Image upload failed. Please try again.");
      setShowErrorModal(true);
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    // Make sure required fields are provided
    if (!formData.title) {
      setValidationMessage("Please provide a title for the article.");
      setShowValidationModal(true);
      return false;
    }

    // Ensure content is not empty
    if (!formData.content) {
      setValidationMessage("Please add some content to your article.");
      setShowValidationModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (publish) => {
    // If publishing and not already confirmed, show confirmation modal
    if (publish && !publishPending) {
      setPublishPending(true);
      setShowPublishConfirmModal(true);
      return;
    }

    // Clear pending flag if we got here from modal confirmation
    setPublishPending(false);

    // Validate before submitting
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Validate citations - remove empty ones
      const validCitations = citations.filter(
        (citation) => citation.title.trim() !== "" && citation.url.trim() !== ""
      );

      // Prepare the article data
      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const articleData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || "",
        category: formData.category || "",
        coverImage: formData.coverImage || "",
        photoCredit: formData.photoCredit || "",
        tags: tagsArray,
        published: publish,
        author: formData.author || "Admin",
        citations: validCitations,
        quotes: quotes.filter((quote) => quote.text.trim() !== ""),
      };

      console.log("Submitting article data:", articleData);

      if (isEditing) {
        await articlesApi.admin.update(id, articleData);
      } else {
        await articlesApi.admin.create(articleData);
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error saving article:", err);
      setSaving(false);

      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        setErrorMessage("Your admin session has expired. Please log in again.");
        setShowErrorModal(true);
      } else {
        // Show a more detailed error message
        if (err.response?.data?.message) {
          setErrorMessage(`Error: ${err.response.data.message}`);
        } else {
          setErrorMessage(
            "Failed to save article. Please check all required fields and try again."
          );
        }
        setShowErrorModal(true);
      }
    }
  };

  // Handle modal close and navigate to dashboard
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/admin");
  };

  // Handle error modal close with authentication check
  const handleErrorClose = () => {
    setShowErrorModal(false);

    // If session expired, redirect to login
    if (errorMessage.includes("session has expired")) {
      logout("admin");
      navigate("/admin/login");
    }
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <HeaderContent>
          <div>
            <EditorBreadcrumb>
              <BreadcrumbLink to="/admin">Dashboard</BreadcrumbLink>
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
              <span>{isEditing ? "Edit Article" : "New Article"}</span>
            </EditorBreadcrumb>

            <HeaderTitle>
              {isEditing ? "Edit Article" : "Create New Article"}
            </HeaderTitle>
            <SubTitle>
              {isEditing
                ? "Update your article content, media, and publishing settings."
                : "Start crafting your story with rich media and formatting options."}
            </SubTitle>
          </div>

          <ButtonGroup>
            <Button className="secondary" onClick={() => navigate("/admin")}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </Button>
          </ButtonGroup>
        </HeaderContent>
      </EditorHeader>

      <Form>
        <EditorSection>
          <h2>Basic Information</h2>
          <FormGroup>
            <Label>Title</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter article title"
            />
          </FormGroup>

          {/* Author field */}
          <FormGroup>
            <Label>Author</Label>
            <Input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Category</Label>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Tags (comma separated)</Label>
              <Input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. politics, government, election"
              />
              <InputNote>
                Add relevant keywords to help readers discover your article
              </InputNote>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Summary</Label>
            <TextArea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Write a brief summary of your article (appears in previews)"
            />
          </FormGroup>
        </EditorSection>

        <EditorSection>
          <h2>Article Content</h2>
          <FormGroup>
            <Label>Content</Label>
            <CustomQuill>
              <ReactQuill
                value={formData.content}
                onChange={handleContentChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
              />
            </CustomQuill>
          </FormGroup>
        </EditorSection>
        <EditorSection>
          <h2>Featured Quotes</h2>
          <QuoteEditor quotes={quotes} onChange={setQuotes} />
        </EditorSection>
        <EditorSection>
          <h2>Citations</h2>
          <CitationsContainer>
            {citations.map((citation, index) => (
              <CitationItem key={index}>
                <CitationInputs>
                  <Input
                    type="text"
                    placeholder="Citation title or description"
                    value={citation.title}
                    onChange={(e) =>
                      handleCitationChange(index, "title", e.target.value)
                    }
                  />
                  <Input
                    type="url"
                    placeholder="URL (e.g., https://example.com)"
                    value={citation.url}
                    onChange={(e) =>
                      handleCitationChange(index, "url", e.target.value)
                    }
                  />
                </CitationInputs>
                <CitationControls>
                  <Button
                    className="secondary"
                    onClick={() => insertCitationLink(index)}
                    style={{ padding: "0.5rem", minWidth: "6rem" }}
                    disabled={!citation.title || !citation.url}
                  >
                    Insert
                  </Button>
                  <RemoveButton onClick={() => removeCitation(index)}>
                    ×
                  </RemoveButton>
                </CitationControls>
              </CitationItem>
            ))}
            <AddCitationButton onClick={addCitation}>
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
              Add Citation
            </AddCitationButton>
            <InputNote>
              Add citations with working URLs that will be linked in the
              article. Click "Insert" to add a citation link to the editor.
            </InputNote>
          </CitationsContainer>
        </EditorSection>

        <EditorSection>
          <h2>Featured Image</h2>
          <FormGroup>
            <Label>Cover Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageUploading}
            />
            <InputNote>Recommended size: 1600x900px (16:9 ratio)</InputNote>

            {imageUploading && (
              <UploadingIndicator>Uploading image...</UploadingIndicator>
            )}

            {formData.coverImage && (
              <ImagePreviewContainer>
                <ImagePreview src={formData.coverImage} alt="Cover preview" />
                {formData.photoCredit && (
                  <PhotoCreditDisplay>
                    Photo: {formData.photoCredit}
                  </PhotoCreditDisplay>
                )}
              </ImagePreviewContainer>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Photo Credit</Label>
            <Input
              type="text"
              name="photoCredit"
              value={formData.photoCredit}
              onChange={handleChange}
              placeholder="Photographer or source name"
            />
          </FormGroup>
        </EditorSection>

        <ButtonGroup>
          <Button
            className="secondary"
            onClick={() => handleSubmit(false)}
            disabled={saving}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Save as Draft
          </Button>

          <Button
            className="primary"
            onClick={() => handleSubmit(true)}
            disabled={saving}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 5L19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isEditing ? "Update & Publish" : "Publish"}
          </Button>
        </ButtonGroup>
      </Form>

      {/* Modals */}
      {/* Success Modal */}
      <EnhancedModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Success"
        size="small"
        footer={
          <Button className="primary" onClick={handleSuccessClose}>
            OK
          </Button>
        }
      >
        {isEditing
          ? "Your article has been updated successfully."
          : "Your article has been created successfully."}
      </EnhancedModal>

      {/* Error Modal */}
      <EnhancedModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        title="Error"
        size="small"
        footer={
          <Button className="primary" onClick={handleErrorClose}>
            OK
          </Button>
        }
      >
        {errorMessage}
      </EnhancedModal>

      {/* Validation Modal */}
      <EnhancedModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Required Fields"
        size="small"
        footer={
          <Button
            className="primary"
            onClick={() => setShowValidationModal(false)}
          >
            OK
          </Button>
        }
      >
        {validationMessage}
      </EnhancedModal>

      {/* Publish Confirmation Modal */}
      <EnhancedModal
        isOpen={showPublishConfirmModal}
        onClose={() => {
          setShowPublishConfirmModal(false);
          setPublishPending(false);
        }}
        title="Publish Article"
        size="small"
        footer={
          <>
            <Button
              className="secondary"
              onClick={() => {
                setShowPublishConfirmModal(false);
                setPublishPending(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="primary"
              onClick={() => {
                setShowPublishConfirmModal(false);
                handleSubmit(true);
              }}
            >
              Publish
            </Button>
          </>
        }
      >
        This article will be visible to all site users. Are you sure you want to
        publish it now?
      </EnhancedModal>

      {/* Loading overlay */}
      <LoadingOverlay $active={saving}>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>
            {isEditing ? "Updating article..." : "Creating article..."}
          </LoadingText>
        </LoadingContent>
      </LoadingOverlay>
    </EditorContainer>
  );
};

export default ArticleEditor;
