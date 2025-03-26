import React, { useState } from "react";
// import "../../App.css";
// import "../Filters/Filters.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import pencilIcon from "../../assets/icons/pencil-fill.svg";
import AdminEditModal from "../AdminEditModal/AdminEditModal";
import TextareaAutosize from "react-textarea-autosize";
import { FilterOption } from "../../interfaces/Filters";

interface FiltersProps {
  filterId: number;
  isActive: boolean;
  title: string;
  options: FilterOption[];
  selectedOptions: string[];
  setSelectedOptions: (selected: string[]) => void;
  className?: string;
  onSave: (
    isActive: boolean,
    filterId: number,
    title: string,
    options: FilterOption[],
  ) => void;
  onFilterDelete: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  filterId,
  isActive,
  title,
  options,
  selectedOptions,
  setSelectedOptions,
  className,
  onSave,
  onFilterDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editableOptions, setEditableOptions] =
    useState<FilterOption[]>(options);

  const handleTitleChange = (value: string) => {
    setEditedTitle(value);
  };

  const handleOptionChange = (option: string) => {
    const currentSelected = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    setSelectedOptions(currentSelected);
  };

  const handleUpdateChanges = async (
    isActive: boolean,
    filterId: number,
    updatedTitle: string,
    updatedOptions: FilterOption[],
  ) => {
    try {
      console.log("Handle update changes:", updatedTitle, updatedOptions);
      await onSave(isActive, filterId, updatedTitle, updatedOptions);
      setIsEditModalOpen(false);
      setEditedTitle(updatedTitle);
      setEditableOptions(updatedOptions);
      console.log("Changes updated successfully.");
    } catch (error) {
      console.error("An error occurred while saving changes:", error);
    }
  };

  const createCheckboxId = (option: string, index: number) => {
    return `checkbox-${title.replace(/\s+/g, "")}-${option.replace(/\s+/g, "")}-${index}`;
  };

  return (
    <div className={`filter-box ${className || ""}`}>
      <h3>
        {isEditModalOpen ? (
          <TextareaAutosize
            maxRows={2}
            style={{ all: "unset", width: "100%" }}
            value={editedTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        ) : (
          <span>{title}</span>
        )}
        <img
          src={pencilIcon}
          alt="Edit"
          onClick={() => setIsEditModalOpen(true)}
          className="pencil-edit-icon"
        />
      </h3>
      <div className="filter-input-container">
        <input
          type="text"
          className="filter-search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FontAwesomeIcon icon={faSearch} className="filter-search-icon" />
      </div>
      <div className="filter-options">
        {options
          .filter((option) => option.isActive)
          .map((option, index) => {
            const uniqueId = createCheckboxId(option.optionName, index);
            return (
              <React.Fragment key={uniqueId}>
                <input
                  type="checkbox"
                  id={uniqueId}
                  className="custom-checkbox"
                  value={option.optionName}
                  checked={selectedOptions.includes(option.optionName)}
                  onChange={() => handleOptionChange(option.optionName)}
                />
                <label htmlFor={uniqueId}>{option.optionName}</label>
              </React.Fragment>
            );
          })}
      </div>

      {isEditModalOpen && (
        <AdminEditModal
          filterId={filterId}
          title={editedTitle}
          options={editableOptions}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateChanges}
          isActive={isActive}
          onFilterDelete={onFilterDelete}
        />
      )}
    </div>
  );
};

export default Filters;
