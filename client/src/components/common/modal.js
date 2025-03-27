// client/src/components/common/Modal.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: rgba(30, 30, 30, 0.9);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: ${(props) =>
    props.$size === "large"
      ? "800px"
      : props.$size === "small"
      ? "400px"
      : "600px"};
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: white;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`;

const ModalBody = styled.div`
  color: rgba(255, 255, 255, 0.8);
`;

const ModalFooter = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(
      135deg,
      rgba(70, 130, 180, 0.8) 0%,
      rgba(50, 100, 150, 0.9) 100%
    );
    color: white;
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  footer = null,
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Render modal using portal to avoid z-index and styling issues
  return ReactDOM.createPortal(
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $size={size} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default Modal;
