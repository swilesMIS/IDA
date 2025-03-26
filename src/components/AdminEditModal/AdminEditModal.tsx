import React, { useEffect, useState } from "react";
// import "../AdminEditModal/AdminEditModal.css";
import { FilterOption } from "../../interfaces/Filters";
import { DatabaseApiItem } from "../../interfaces/DatabaseInterfaces";
import { fetchDatabases } from "../../services/DatabaseService";
import {
  fetchDbCategory,
  postDbCategory,
} from "../../services/DbCategoryService";
import { DbCategory } from "../../interfaces/DbCategory";
import Select from "react-select";
import ConfirmationModal from "../CofirmationModal/ConfirmationModal";
import axios from "axios";

const API_URL = "http://localhost:5092/api";

interface ModalProps {
  filterId: number;
  title: string;
  options: FilterOption[];
  isActive: boolean;
  onClose: () => void;
  onSave: (
    isActive: boolean,
    filterId: number,
    title: string,
    options: FilterOption[],
  ) => void;
  onFilterDelete: () => void;
}

interface OptionType {
  value: number;
  label: string;
}

const AdminEditModal: React.FC<ModalProps> = ({
  filterId,
  title,
  options,
  onClose,
  onSave,
  isActive: initialIsActive,
  onFilterDelete,
}) => {
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableOptions, setEditableOptions] =
    useState<FilterOption[]>(options);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [databases, setDatabases] = useState<DatabaseApiItem[]>([]);
  const [selectedDatabases, setSelectedDatabases] = useState<OptionType[]>([]);
  const [assignedOptions, setAssignedOptions] = useState<Set<number>>(
    new Set(),
  );
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatabases = async () => {
      try {
        const response = await fetchDatabases(); // Ensure fetchDatabases is correctly implemented
        setDatabases(response.$values); // Adjust based on actual API response structure
      } catch (error) {
        console.error("Failed to fetch databases", error);
        setError("Failed to load databases");
      }
    };

    loadDatabases();
  }, []);

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditableTitle(newTitle);
  };

  const handleOptionChange = (index: number, newName: string) => {
    const updatedOptions = editableOptions.map((option, idx) =>
      idx === index ? { ...option, optionName: newName } : option,
    );
    setEditableOptions(updatedOptions);
  };

  const handleIsActiveChangeForOption = (
    index: number,
    newIsActive: boolean,
  ) => {
    const updatedOptions = editableOptions.map((option, idx) =>
      idx === index ? { ...option, isActive: newIsActive } : option,
    );
    setEditableOptions(updatedOptions);
  };

  const handleIsActiveChangeForFilter = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsActive(e.target.checked);
  };

  const addBlankOption = () => {
    const newOption: FilterOption = {
      optionId: 0,
      filterID: 0,
      optionName: "",
      filter: { $ref: "" },
      isActive: true,
    };
    setEditableOptions([...editableOptions, newOption]);
  };

  const deleteOption = (index: number) => {
    const updatedOptions = [...editableOptions];
    updatedOptions.splice(index, 1);
    setEditableOptions(updatedOptions);
  };

  const handleSaveChanges = async () => {
    if (!editableTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    if (editableOptions.some((option) => !option.optionName.trim())) {
      setError("Options cannot be empty");
      return;
    }

    try {
      // Step 1: Fetch existing categories
      const existingCategoriesResponse = await fetchDbCategory(); // Adjust according to how your fetch function works
      const existingCategories = existingCategoriesResponse.$values;

      // Step 2: Prepare items to post, excluding already existing pairs
      const dbCategoriesToPost: DbCategory[] = Array.from(
        assignedOptions,
      ).flatMap((optionId) => {
        const option = editableOptions.find((o) => o.optionId === optionId);
        if (!option) return [];

        return selectedDatabases
          .map((db) => ({
            $id: "",
            db_categoryID: 0,
            databaseID: db.value,
            optionName: option.optionName,
            optionId: option.optionId,
          }))
          .filter(
            (dbCategory) =>
              !existingCategories.some(
                (ec: DbCategory) =>
                  ec.databaseID === dbCategory.databaseID &&
                  ec.optionName === dbCategory.optionName,
              ),
          );
      });

      // Step 3: Post new dbCategories
      await onSave(isActive, filterId, editableTitle, editableOptions);
      await Promise.all(
        dbCategoriesToPost.map((dbCategory) => postDbCategory(dbCategory)),
      );

      onClose();
      setError(null);
    } catch (error) {
      console.error("Failed to save changes", error);
      setError("An error occurred while saving changes");
    }
  };

  const handleDelete = () => {
    openConfirmationModal(); // Open the modal to confirm deletion
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/filters/${filterId}/options`,
      );
      if (response.data && Array.isArray(response.data.$values)) {
        const optionIds = response.data.$values.map(
          (option: any) => option.optionId,
        );
        for (const optionId of optionIds) {
          await axios.delete(`${API_URL}/filters/filterOptions/${optionId}`);
        }
        await axios.delete(`${API_URL}/filters/${filterId}`);
        console.log("Filter and all associated options deleted successfully.");
        onFilterDelete();
      } else {
        console.error("Unexpected response data structure:", response.data);
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
    closeConfirmationModal(); // Close modal after action
    onClose(); // Optionally close the edit modal as well
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ color: "red", marginTop: "5px" }}>{error}</div>
          )}
          <div className="form-group inline-group">
            <label htmlFor="editableTitle">Title: </label>
            <input
              type="text"
              id="editableTitle"
              name="editableTitle"
              value={editableTitle}
              onChange={handleTitleChange}
            />
            <label htmlFor="filterIsActive" className="checkbox-label">
              Is Active? :
            </label>
            <input
              type="checkbox"
              id="filterIsActive"
              checked={isActive}
              onChange={handleIsActiveChangeForFilter}
            />
          </div>
          <div className="form-group options-label">
            <label>Options</label>
          </div>
          <div className="overflow">
            {editableOptions.map((option, index) => (
              <div key={index} className="form-group option-item">
                <div className="form-group inline-group">
                  <input
                    type="text"
                    id={`option-${index}`}
                    name={`option-${index}`}
                    value={option.optionName}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {selectedDatabases.length > 0 && (
                    <>
                      <label
                        htmlFor={`assignToDb-${index}`}
                        className="checkbox-label"
                      >
                        Assign to DB:
                      </label>
                      <input
                        type="checkbox"
                        id={`assignToDb-${index}`}
                        checked={assignedOptions.has(option.optionId)}
                        onChange={(e) => {
                          const newAssignedOptions = new Set(assignedOptions);
                          if (e.target.checked) {
                            newAssignedOptions.add(option.optionId);
                          } else {
                            newAssignedOptions.delete(option.optionId);
                          }
                          setAssignedOptions(newAssignedOptions);
                        }}
                      />
                    </>
                  )}
                  <label htmlFor="optionIsActive" className="checkbox-label">
                    Is Active? :
                  </label>
                  <input
                    type="checkbox"
                    checked={option.isActive}
                    onChange={(e) =>
                      handleIsActiveChangeForOption(index, e.target.checked)
                    }
                  />
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteOption(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="form-group">
            <button
              type="button"
              className="add-option-button"
              onClick={addBlankOption}
            >
              Add Option
            </button>
          </div>
          <div className="form-group">
            <label>Select Databases to Apply Filters to:</label>
            <Select
              isMulti
              options={databases.map((db) => ({
                value: db.databaseID,
                label: db.title,
              }))}
              styles={{
                container: (provided) => ({
                  ...provided,
                  width: "100%",
                }),
                control: (provided) => ({
                  ...provided,
                  width: "100%",
                }),
              }}
              onChange={(selectedOptions) => {
                setSelectedDatabases(
                  selectedOptions
                    ? selectedOptions
                        .map((option: OptionType) => {
                          const match = databases.find(
                            (db) => db.databaseID === option.value,
                          );
                          return match
                            ? { value: match.databaseID, label: match.title }
                            : undefined;
                        })
                        .filter(
                          (
                            option: OptionType | undefined,
                          ): option is OptionType => option !== undefined,
                        )
                    : [],
                );
              }}
              value={selectedDatabases}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="modal-close-btn" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="delete-linkgrid-btn"
            onClick={handleDelete}
          >
            Delete
          </button>
          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            onClose={closeConfirmationModal}
            onConfirm={confirmDelete}
          >
            Are you sure you want to delete the filter &quot;{title}&quot;?
          </ConfirmationModal>
          <button
            type="button"
            className="modal-save-btn"
            onClick={handleSaveChanges}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditModal;
