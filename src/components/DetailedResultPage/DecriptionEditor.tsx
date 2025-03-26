import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import pencilIcon from "../../assets/icons/pencil-fill.svg"; // Adjust the path as needed
import EditModal from "../EditModal/EditModal";

interface DescriptionEditorProps {
  description: string;
  // isEditing: boolean;
  // setEditing: (editing: boolean) => void;
  onDescriptionChange: (updatedDescription: string) => void;
}

export const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
  description,
  // setEditing,
  onDescriptionChange,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);

  const handleOpenModal = () => {
    setModalIsOpen(true);
    setTempDescription(description);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleConfirm = () => {
    onDescriptionChange(tempDescription);
    setModalIsOpen(false);
  };

  return (
    <aside className="database-description">
      <h2>
        <img
          className="edit-icon"
          src={pencilIcon}
          alt="Edit Description"
          onClick={handleOpenModal}
        />
        Description:
      </h2>
      <p>{description}</p>
      <EditModal
        isOpen={modalIsOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      >
        <TextareaAutosize
          className="modal-textarea"
          value={tempDescription}
          onChange={(e) => setTempDescription(e.target.value)}
        />
      </EditModal>
    </aside>
  );
};

// export const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
//   description,
//   isEditing,
//   setEditing,
//   onDescriptionChange,
// }) => {
//   return (
//     <aside className="database-description">
//       <h2>
//         <img
//           className="edit-icon"
//           src={pencilIcon}
//           alt="Edit Description"
//           onClick={() => setEditing(true)}
//         />
//         Description:
//       </h2>
//       <p>
//         <TextareaAutosize
//           disabled={!isEditing}
//           style={{ all: "unset", width: "100%" }}
//           value={description}
//           maxRows={10}
//           onChange={(e) => onDescriptionChange(e.target.value)}
//         />
//       </p>
//     </aside>
//   );
// };
