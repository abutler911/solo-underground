import React, { useState } from "react";
import styled from "styled-components";
import api from "../../utils/api";

const UploaderContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const UploadInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

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

const PhotoCreditInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }
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

const Label = styled.label`
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const InputNote = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0.25rem 0 0;
`;

const ErrorMessage = styled.p`
  font-size: 0.85rem;
  color: #ff5252;
  margin: 0.5rem 0 0;
`;

const ImageUploader = ({ value, onChange, onCreditChange, photoCredit }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      console.log("Uploading image:", file.name);

      const adminToken = localStorage.getItem("admin_token");

      if (!adminToken) {
        setError("Admin authentication required");
        setIsUploading(false);
        return;
      }

      const response = await api.post("/api/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      console.log("Upload response:", response.data);

      if (response.data && response.data.url) {
        onChange(response.data.url);
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (err) {
      console.error("Error uploading image:", err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(`Upload failed: ${err.response.data.message}`);
      } else if (err.message) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError("Image upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocalImagePreview = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const tempUrl = URL.createObjectURL(file);
      onChange(tempUrl);
      console.log("Created temporary local preview:", tempUrl);
    } catch (err) {
      console.error("Error creating preview:", err);
      setError("Failed to create image preview");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <UploaderContainer>
      <Label>Cover Image</Label>
      <UploadInput
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isUploading}
      />
      <InputNote>Recommended size: 1600x900px (16:9 ratio)</InputNote>

      {isUploading && (
        <UploadingIndicator>Uploading image...</UploadingIndicator>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {value && !isUploading && (
        <>
          <ImagePreviewContainer>
            <ImagePreview src={value} alt="Preview" />
          </ImagePreviewContainer>

          <Label htmlFor="photoCredit" style={{ marginTop: "1rem" }}>
            Photo Credit
          </Label>
          <PhotoCreditInput
            id="photoCredit"
            type="text"
            value={photoCredit || ""}
            onChange={(e) => onCreditChange(e.target.value)}
            placeholder="Photographer or source name"
          />
        </>
      )}
    </UploaderContainer>
  );
};

export default ImageUploader;
