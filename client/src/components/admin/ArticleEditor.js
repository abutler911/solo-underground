// client/src/components/admin/ArticleEditor.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../../utils/api";

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

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    summary: "",
    content: "",
    coverImage: "",
    photoCredit: "",
    tags: "",
  });

  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  // const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    "Music",
    "Culture",
    "Art & Design",
    "Technology",
    "Lifestyle",
  ];

  useEffect(() => {
    if (isEditing) {
      const fetchArticle = async () => {
        try {
          const res = await api.get(`/api/admin/articles/${id}`);

          setFormData({
            ...res.data,
            tags: res.data.tags ? res.data.tags.join(", ") : "",
          });
        } catch (err) {
          console.error("Error fetching article", err);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "solo_underground"); // Your Cloudinary upload preset

    setImageUploading(true);

    try {
      // Using Cloudinary directly from the frontend
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        coverImage: data.secure_url,
      }));

      setImageUploading(false);
    } catch (err) {
      console.error("Error uploading image", err);
      setImageUploading(false);
    }
  };

  const handleSubmit = async (publish) => {
    setSaving(true);

    try {
      // Prepare the article data
      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      // Make sure required fields are provided
      if (!formData.title) {
        alert("Title is required");
        setSaving(false);
        return;
      }

      // Ensure content is not empty
      if (!formData.content) {
        alert("Content is required");
        setSaving(false);
        return;
      }

      const articleData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || "",
        category: formData.category || "",
        coverImage: formData.coverImage || "",
        photoCredit: formData.photoCredit || "",
        tags: tagsArray,
        published: publish,
      };

      console.log("Submitting article data:", articleData);

      if (isEditing) {
        const response = await api.put(
          `/api/admin/articles/${id}`,
          articleData
        );
        console.log("Update response:", response.data);
      } else {
        const response = await api.post("/api/admin/articles", articleData);
        console.log("Create response:", response.data);
      }

      // Success - redirect to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Error saving article:", err);

      // Show a more detailed error message
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(
          "Failed to save article. Please check all required fields and try again."
        );
      }

      setSaving(false);
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

          <FormRow>
            <FormGroup>
              <Label>Category</Label>
              <Input
                as="select"
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
              </Input>
            </FormGroup>

            <FormGroup>
              <Label>Tags (comma separated)</Label>
              <Input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. indie, music, interview"
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
