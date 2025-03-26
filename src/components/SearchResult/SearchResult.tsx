import React, { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmationModal from "../CofirmationModal/ConfirmationModal";
// import "./SearchResult.css";

interface SearchResultTileProps {
  id: number;
  title: string;
  author: string;
  access: string;
  lastUpdated: string;
  handleDelete: (id: number) => void;
}

const SearchResultTile: React.FC<SearchResultTileProps> = ({
  id,
  title,
  author,
  access,
  lastUpdated,
  handleDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const showModal = (id: number) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
  };

  const confirmDelete = () => {
    if (selectedId !== null) {
      handleDelete(selectedId);
      closeModal();
    }
  };

  return (
    <div className="search-result-tile">
      <div className="search-result-tile-content">
        <h2>
          <u>
            <Link
              style={{ textDecoration: "none", color: "inherit" }}
              to={`/results/${id}`}
            >
              {title}
            </Link>
          </u>
        </h2>
        <span>
          <strong>Author:</strong> {author}
        </span>
        <span>
          <strong>Access:</strong> {access}
        </span>
        <span>
          <strong>Last Updated:</strong> {lastUpdated}
        </span>
      </div>
      <div className="search-result-button-container">
        <Link className="search-result-button" to={`/results/${id}`}>
          Edit
        </Link>
        <button className="search-result-button" onClick={() => showModal(id)}>
          Delete
        </button>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      >
        Are you sure you want to delete the {title} database?
      </ConfirmationModal>
    </div>
  );
};

export default SearchResultTile;
