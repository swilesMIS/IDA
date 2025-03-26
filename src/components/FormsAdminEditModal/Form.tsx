import React, { useState } from "react";
import "../FormsAdminEditModal/Form.css";
import { FilterOption } from "../../interfaces/Filters";

interface FormProps {
  title: string;
  options: FilterOption[];
  isActive: boolean;
  onTitleChange: (title: string) => void;
  onOptionsChange: (options: FilterOption[]) => void;
  onIsActiveChange?: (isActive: boolean) => void;
}

const Form: React.FC<FormProps> = ({
  title,
  options,
  isActive: initialIsActive,
  onTitleChange,
  onOptionsChange,
  onIsActiveChange,
}) => {
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableOptions, setEditableOptions] =
    useState<FilterOption[]>(options);
  const [isActive, setIsActive] = useState(initialIsActive);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditableTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleOptionChange = (index: number, newName: string) => {
    const updatedOptions = editableOptions.map((option, idx) =>
      idx === index ? { ...option, optionName: newName } : option,
    );
    setEditableOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  const handleIsActiveChange = (index: number, isActive: boolean) => {
    const updatedOptions = editableOptions.map((option, idx) =>
      idx === index ? { ...option, isActive } : option,
    );
    setEditableOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  const handleIsActiveChangeForFilter = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newIsActive = e.target.checked;
    setIsActive(newIsActive);
    if (onIsActiveChange) {
      onIsActiveChange(newIsActive);
    }
  };

  const addBlankOption = () => {
    const newOption: FilterOption = {
      optionId: 0,
      filterID: 0, // Assuming you'll assign this upon actual creation/saving
      optionName: "",
      filter: { $ref: "" }, // Adjust according to how you handle references
      isActive: true,
    };
    setEditableOptions([...editableOptions, newOption]);
  };

  const deleteOption = (index: number) => {
    const updatedOptions = [...editableOptions];
    updatedOptions.splice(index, 1);
    setEditableOptions(updatedOptions);
    onOptionsChange(updatedOptions);
  };

  return (
    <form>
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
              <label htmlFor="optionIsActive" className="checkbox-label">
                Is Active? :
              </label>
              <input
                type="checkbox"
                checked={option.isActive}
                onChange={(e) => handleIsActiveChange(index, e.target.checked)}
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
    </form>
  );
};

export default Form;
