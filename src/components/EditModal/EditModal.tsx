import React from "react";
// import "./EditModal.css";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
        <div className="modal-actions">
          <button className="confirm" onClick={onConfirm}>
            Confirm
          </button>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
