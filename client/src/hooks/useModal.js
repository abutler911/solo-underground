// client/src/hooks/useModal.js
import { useState } from "react";

// A simple hook to handle modal state across components
const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(!isOpen);

  return { isOpen, openModal, closeModal, toggleModal };
};

export default useModal;
