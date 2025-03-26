import React, { useState } from "react";
import "../FormsAdminEditModal/Form.css";

interface AddFilterFormProps {
  title: string;
  options: string[];
  onTitleChange: (title: string) => void;
  onOptionsChange: (options: string[]) => void;
  onTitleError: (error: string) => void;
}

const AddFilterForm: React.FC<AddFilterFormProps> = ({
  title,
  options,
  onTitleChange,
  onOptionsChange,
  onTitleError,
}) => {
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableOptions, setEditableOptions] = useState<string[]>([
    ...options,
    "",
  ]);
  const [titleError, setTitleError] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditableTitle(newTitle);
    if (newTitle.trim() == "") {
      setTitleError("Title cannot be empty");
      onTitleError("Title cannot be empty");
    } else {
      setTitleError("");
      onTitleError("");
      onTitleChange(newTitle);
    }
  };

  const handleOptionChange = (index: number, newValue: string) => {
    const updatedOptions = [...editableOptions];
    updatedOptions[index] = newValue;
    setEditableOptions(updatedOptions);
    onOptionsChange(updatedOptions.filter((option) => option.trim() !== ""));
  };

  const addBlankOption = () => {
    setEditableOptions([...editableOptions, ""]);
  };

  const deleteOption = (index: number) => {
    const updatedOptions = [...editableOptions];
    updatedOptions.splice(index, 1);
    setEditableOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  return (
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
        {titleError && (
          <div style={{ color: "red", marginTop: "5px" }}>{titleError}</div>
        )}
      </div>
      <div className="form-group options-label">
        <label>Options</label>
      </div>
      <div className="overflow">
        {editableOptions.map((option, index) => (
          <div key={index} className="form-group option-item">
            <div className="input-container">
              <input
                type="text"
                id={`option-${index}`}
                name={`option-${index}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
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
      <div className="form-group add-option-group">
        <button
          type="button"
          className="add-option-button"
          onClick={addBlankOption}
        >
          Add Option
        </button>
      </div>
    </form>
  );
};

export default AddFilterForm;
