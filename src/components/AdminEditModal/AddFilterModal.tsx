import React, { useEffect, useState } from "react";
// import "../AdminEditModal/AdminEditModal.css";
// import "../FormsAdminEditModal/Form.css";
import Select from "react-select";
import { fetchDatabases } from "../../services/DatabaseService";
import { postDbCategory } from "../../services/DbCategoryService";
import { DbCategory } from "../../interfaces/DbCategory";
import { DatabaseApiItem } from "../../interfaces/DatabaseInterfaces";
import { FilterOption } from "../../interfaces/Filters";

interface AddFilterModalProps {
  title: string;
  options: FilterOption[];
  onClose: () => void;
  onSave: (title: string, options: FilterOption[]) => Promise<void>;
}

interface OptionType {
  value: number;
  label: string;
}

const AddFilterModal: React.FC<AddFilterModalProps> = ({
  title,
  options,
  onClose,
  onSave,
}) => {
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableOptions, setEditableOptions] =
    useState<FilterOption[]>(options);
  const [databases, setDatabases] = useState<DatabaseApiItem[]>([]);
  const [selectedDatabases, setSelectedDatabases] = useState<OptionType[]>([]);
  const [assignedOptions, setAssignedOptions] = useState<Set<number>>(
    new Set(),
  );
  const [titleError, setTitleError] = useState("");
  const [nextOptionId, setNextOptionId] = useState(1);
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditableTitle(newTitle);
    setTitleError(newTitle.trim() === "" ? "Title cannot be empty" : "");
  };

  const handleOptionChange = (index: number, newName: string) => {
    const updatedOptions = editableOptions.map((option, idx) =>
      idx === index ? { ...option, optionName: newName } : option,
    );
    setEditableOptions(updatedOptions);
  };

  const addBlankOption = () => {
    const newOption: FilterOption = {
      optionId: nextOptionId,
      filterID: 0,
      optionName: "",
      filter: { $ref: "" },
      isActive: true,
    };
    setEditableOptions([...editableOptions, newOption]);
    setNextOptionId(nextOptionId + 1);
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

    await onSave(editableTitle, editableOptions);

    const dbCategoriesToPost: DbCategory[] = Array.from(
      assignedOptions,
    ).flatMap((optionId) => {
      const option = editableOptions.find((o) => o.optionId === optionId);
      if (!option) return []; // Skip if the option was not found

      return selectedDatabases.map((db) => ({
        $id: "", // Assuming the backend generates this
        db_categoryID: 0, // Assuming the backend generates this
        databaseID: db.value,
        optionName: option.optionName,
        optionId: option.optionId,
      }));
    });
    await Promise.all(
      dbCategoriesToPost.map((dbCategory) => postDbCategory(dbCategory)),
    );
    onClose();
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
          {titleError && (
            <div style={{ color: "red", marginTop: "5px" }}>{titleError}</div>
          )}
          <form>
            <div className="form-group">
              <label htmlFor="editableTitle">Title</label>
              <input
                type="text"
                id="editableTitle"
                name="editableTitle"
                value={editableTitle}
                onChange={handleTitleChange}
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
                      value={option.optionName}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
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
            <div className="form-group add-option-group">
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
                name="databases"
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
                classNamePrefix="select"
                onChange={(newValue) =>
                  setSelectedDatabases([...newValue])
                }
                value={selectedDatabases}
              />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="modal-close-btn" onClick={onClose}>
            Close
          </button>
          {!titleError && editableTitle.trim() !== "" && (
            <button
              type="button"
              className="modal-save-btn"
              onClick={handleSaveChanges}
            >
              Save changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFilterModal;
