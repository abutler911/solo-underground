// client/src/components/common/EnhancedModal.js
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
  background-color: rgba(25, 25, 25, 0.95);
  border-radius: 12px;
  padding: 0;
  width: 100%;
  max-width: ${(props) =>
    props.$size === "large"
      ? "800px"
      : props.$size === "small"
      ? "400px"
      : "550px"};
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-20px)"};
  transition: all 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(
    to right,
    rgba(40, 40, 40, 0.9),
    rgba(20, 20, 20, 0.95)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: white;
  font-weight: 600;
  font-family: "Playfair Display", serif;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 2rem;
    height: 2px;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.5),
      rgba(255, 255, 255, 0)
    );
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 1.75rem;
  color: rgba(255, 255, 255, 0.8);
  overflow-y: auto;
  font-size: 1rem;
  line-height: 1.6;
  max-height: calc(90vh - 140px);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

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

// Icon component for modal types
const Icon = styled.div`
  width: ${(props) => props.$size || "40px"};
  height: ${(props) => props.$size || "40px"};
  background-color: ${(props) => {
    switch (props.$type) {
      case "error":
        return "rgba(220, 53, 69, 0.15)";
      case "success":
        return "rgba(40, 167, 69, 0.15)";
      case "warning":
        return "rgba(255, 193, 7, 0.15)";
      case "info":
        return "rgba(23, 162, 184, 0.15)";
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case "error":
        return "#ff6b6b";
      case "success":
        return "#51cf66";
      case "warning":
        return "#ffd43b";
      case "info":
        return "#4dabf7";
      default:
        return "white";
    }
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
`;

const ContentWithIcon = styled.div`
  display: flex;
  align-items: flex-start;
`;

// Alert modal configuration
const Alert = ({ title, message, onClose, type = "info" }) => {
  // Icon character based on type
  const getIcon = () => {
    switch (type) {
      case "error":
        return "✕";
      case "success":
        return "✓";
      case "warning":
        return "!";
      case "info":
        return "i";
      default:
        return "i";
    }
  };

  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {title || type.charAt(0).toUpperCase() + type.slice(1)}
        </ModalTitle>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </ModalHeader>
      <ModalBody>
        <ContentWithIcon>
          <Icon $type={type}>{getIcon()}</Icon>
          <div>{message}</div>
        </ContentWithIcon>
      </ModalBody>
      <ModalFooter>
        <Button className="primary" onClick={onClose}>
          OK
        </Button>
      </ModalFooter>
    </>
  );
};

// Confirmation modal configuration
const Confirm = ({
  title = "Confirm Action",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "primary",
  cancelButtonClass = "secondary",
  type = "warning",
}) => {
  // Icon character based on type
  const getIcon = () => {
    switch (type) {
      case "error":
        return "✕";
      case "success":
        return "✓";
      case "warning":
        return "!";
      case "info":
        return "i";
      default:
        return "i";
    }
  };

  return (
    <>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <CloseButton onClick={onCancel}>&times;</CloseButton>
      </ModalHeader>
      <ModalBody>
        <ContentWithIcon>
          <Icon $type={type}>{getIcon()}</Icon>
          <div>{message}</div>
        </ContentWithIcon>
      </ModalBody>
      <ModalFooter>
        <Button className={cancelButtonClass} onClick={onCancel}>
          {cancelText}
        </Button>
        <Button className={confirmButtonClass} onClick={onConfirm}>
          {confirmText}
        </Button>
      </ModalFooter>
    </>
  );
};

// Main EnhancedModal component
const EnhancedModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  footer = null,
  modalType = null,
  modalProps = {},
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Render the correct modal content based on modalType
  const renderModalContent = () => {
    if (modalType === "alert") {
      return <Alert {...modalProps} onClose={onClose} />;
    } else if (modalType === "confirm") {
      return <Confirm {...modalProps} onCancel={onClose} />;
    } else {
      return (
        <>
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </ModalHeader>
          <ModalBody>{children}</ModalBody>
          {footer && <ModalFooter>{footer}</ModalFooter>}
        </>
      );
    }
  };

  // Render modal using portal to avoid z-index issues
  return ReactDOM.createPortal(
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent
        $size={size}
        onClick={(e) => e.stopPropagation()}
        $isOpen={isOpen}
      >
        {renderModalContent()}
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

// Helper function to call outside of React components (for alerts, confirms)
const useModalService = () => {
  // Alert modal
  const alert = (message, options = {}) => {
    const modalRoot = document.createElement("div");
    modalRoot.id = "modal-root-" + Date.now();
    document.body.appendChild(modalRoot);

    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(modalRoot);
      document.body.removeChild(modalRoot);
      if (options.onClose) options.onClose();
    };

    const props = {
      isOpen: true,
      onClose: handleClose,
      modalType: "alert",
      modalProps: {
        title: options.title || "Notice",
        message,
        type: options.type || "info",
      },
    };

    ReactDOM.render(<EnhancedModal {...props} />, modalRoot);
  };

  // Confirm modal
  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      const modalRoot = document.createElement("div");
      modalRoot.id = "modal-root-" + Date.now();
      document.body.appendChild(modalRoot);

      const handleClose = (result) => {
        ReactDOM.unmountComponentAtNode(modalRoot);
        document.body.removeChild(modalRoot);
        resolve(result);
      };

      const props = {
        isOpen: true,
        onClose: () => handleClose(false),
        modalType: "confirm",
        modalProps: {
          title: options.title || "Confirm Action",
          message,
          confirmText: options.confirmText || "Confirm",
          cancelText: options.cancelText || "Cancel",
          confirmButtonClass: options.confirmButtonClass || "primary",
          cancelButtonClass: options.cancelButtonClass || "secondary",
          type: options.type || "warning",
          onConfirm: () => handleClose(true),
          onCancel: () => handleClose(false),
        },
      };

      ReactDOM.render(<EnhancedModal {...props} />, modalRoot);
    });
  };

  return { alert, confirm };
};

export { useModalService };
export default EnhancedModal;
