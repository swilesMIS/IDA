import React from "react";
// import "./ConfirmationModal.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  closeButtonText?: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  showConfirmButton = true,
  closeButtonText = "Cancel",
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="centered-text"> 
          {children}
        </div>
        <div className="modal-actions">
          {showConfirmButton && (
            <button className="confirm" onClick={onConfirm}>
              Confirm
            </button>
          )}
          <button className="cancel" onClick={onClose}>
            {closeButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
