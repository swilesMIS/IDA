import React, { ChangeEvent, useEffect, useState } from "react";
import Select from "react-select";
import { MultiValue, ActionMeta } from "react-select";
// import "../AdminEditModal/AdminEditModal.css";
import { GridSettings } from "../../interfaces/GridSettings";
import { LinkGridItem } from "../../interfaces/LinkGridItem";
import {
  createLinkGridItem,
  deleteLinkGridItem,
} from "../../services/LinkGridItemsService";
import { FilterOption } from "../../interfaces/Filters";
import ConfirmationModal from "../CofirmationModal/ConfirmationModal";

interface ManageLinkGridModalProps {
  onClose: () => void;
  onSave: (
    gridSettings: GridSettings,
    linkGridItems: LinkGridItem[],
  ) => Promise<void>;
  gridSettings: GridSettings;
  linkGridItems: LinkGridItem[];
  addLinkGridItem: (newItem: LinkGridItem) => void;
  allFilters: FilterData[];
}

interface FilterData {
  isActive: boolean;
  filterId: number;
  title: string;
  options: FilterOption[];
}

interface OptionType {
  value: string;
  label: string;
}

const ManageLinkGridModal: React.FC<ManageLinkGridModalProps> = ({
  onClose,
  onSave,
  gridSettings,
  linkGridItems,
  addLinkGridItem,
  allFilters,
}) => {
  const [editableGridSettings, setEditableGridSettings] =
    useState<GridSettings>(gridSettings);
  const [selectedLinkGridItemId, setSelectedLinkGridItemId] = useState<
    number | null
  >(null);
  const [editableLinkGridItem, setEditableLinkGridItem] =
    useState<LinkGridItem | null>(null);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [initialCategoryValues, setInitialCategoryValues] = useState<
    OptionType[]
  >([]);
  const [initialTagValues, setInitialTagValues] = useState<OptionType[]>([]);
  const [imagePreview, setImagePreview] = useState("");

  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteButtonClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteConfirmed = () => {
    if (editableLinkGridItem) {
      handleDeleteLinkGridItem(editableLinkGridItem.id);
    }
    setIsModalOpen(false);
  };

  const aggregatedOptions = allFilters.reduce(
    (acc: { value: string; label: string }[], filter) => {
      const filterOptions = filter.options.map((option) => ({
        value: option.optionName,
        label: option.optionName,
      }));
      return acc.concat(filterOptions);
    },
    [],
  );

  // Filter options specifically for tags (assuming filterId 6 is for tags)
  const tagOptions =
    allFilters
      .find((filter) => filter.filterId === 6)
      ?.options.map((option) => ({
        value: option.optionName,
        label: option.optionName,
      })) || [];

  useEffect(() => {
    if (editableLinkGridItem) {
      const searchParams = new URLSearchParams(
        editableLinkGridItem.url.split("?")[1],
      );
      const tags = searchParams.get("Tags")?.split(",") || [];
      const nonEmptyTags = tags.filter((tag) => tag.trim() !== "");
      setInitialTagValues(
        nonEmptyTags.map((tag) => ({ value: tag, label: tag })),
      );
    } else {
      setInitialTagValues([]);
    }
  }, [editableLinkGridItem, editableLinkGridItem?.url]);

  useEffect(() => {
    if (editableLinkGridItem?.imageData) {
      const base64Prefix = "data:image/png;base64,";
      const imageUrl = editableLinkGridItem.imageData.startsWith(base64Prefix)
        ? editableLinkGridItem.imageData
        : base64Prefix + editableLinkGridItem.imageData;
      setImagePreview(imageUrl); // Update the preview URL
    } else {
      setImagePreview(""); // Clear the preview
    }
  }, [editableLinkGridItem]);

  const DEFAULT_IMAGE_DATA = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTEhIVFRUVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAIAAwMBIgACEQEDEQH/xAAXAAADAQAAAAAAAAAAAAAAAAAEBQYH/8QAFhABAQEAAAAAAAAAAAAAAAAAAAER/8QAFQEBAQAAAAAAAAAAAAAAAAAABAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdAByH/9k=";

  const handleAddNewItem = () => {
    // Reset editableLinkGridItem to be an empty form and set isCreatingNew to true
    setEditableLinkGridItem({
      $id: "",
      id: 0,
      title: "",
      imageData: DEFAULT_IMAGE_DATA,
      url: "/results?query=&categories=&Tags=",
      isActive: true,
      query: "",
      categories: "",
      tags: "",
    });
    setInitialCategoryValues([]);
    setInitialTagValues([]);
    setIsCreatingNew(true);
    setIsTitleValid(false);
  };

  const handleCategoriesChange = (
    newValue: MultiValue<OptionType>, // Use MultiValue here
    actionMeta: ActionMeta<OptionType>,
  ) => {
    const selectedCategories = newValue.map((option) => option.value);
    setEditableLinkGridItem((prev) => ({
      ...prev!,
      categories: selectedCategories.join(","),
    }));
    setInitialCategoryValues([...newValue]);
  };

  const handleTagsChange = (
    newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>,
  ) => {
    const selectedTags = newValue.map((option) => option.value).join(",");

    setEditableLinkGridItem((prev) => {
      console.log("prev", prev);
      if (!prev) return prev;
      // Assume you have states like editableQuery and editableCategories that you've updated elsewhere
      const currentQuery = prev.query; // This should be your current state for the query
      const currentCategories = prev.categories?.split(",") ?? []; // Assuming editableCategories is an array of selected categories

      const baseUrl = prev.url.split("?")[0];
      const searchParams = new URLSearchParams();

      // Set query, categories, and tags based on the current state
      if (currentQuery) {
        searchParams.set("query", currentQuery);
      }
      if (currentCategories) {
        searchParams.set("categories", currentCategories.join(","));
      }
      if (selectedTags) {
        searchParams.set("Tags", selectedTags);
      }

      const newUrl = `${baseUrl}?${searchParams.toString()}`;
      console.log("New URL with updated state:", newUrl);

      return {
        ...prev,
        url: newUrl,
      };
    });
  };

  const handleGridSettingsChange = (newSettings: Partial<GridSettings>) => {
    setEditableGridSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const handleLinkGridItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setEditableLinkGridItem((prev) => {
      if (name === "title") {
        setIsTitleValid(value.trim() !== "");
      }
      if (prev === null) return null;
      if (type === "checkbox") {
        return {
          ...prev,
          [name]: checked,
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsTitleValid(true);
    const itemId = parseInt(e.target.value, 10);
    setSelectedLinkGridItemId(itemId);
    const itemToEdit =
      linkGridItems.find((item) => parseInt(item.$id) === itemId) || null;
    if (itemToEdit) {
      const urlParts = itemToEdit.url.split("?")[1];
      const queryParams = new URLSearchParams(urlParts);
      setEditableLinkGridItem({
        ...itemToEdit,
        query: queryParams.get("query") || "",
        categories: queryParams.get("categories") || "",
      });
    } else {
      setEditableLinkGridItem(null);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await onSave(editableGridSettings, linkGridItems);
      console.log("Saving LinkGridItem:", editableLinkGridItem);
      if (isCreatingNew && editableLinkGridItem) {
        try {
          console.log("In save changes", editableLinkGridItem);
          const createdItem = await createLinkGridItem(editableLinkGridItem);
          addLinkGridItem(createdItem);
          setIsCreatingNew(false);
          onClose();
        } catch (error) {
          console.error("Failed to create LinkGridItem:", error);
        }
      } else if (editableLinkGridItem) {
        try {
          console.log("Saving editableLinkGridItem:", editableLinkGridItem);
          const updatedItems = linkGridItems.map((item) =>
            item.id === editableLinkGridItem.id ? editableLinkGridItem : item,
          );
          await onSave(editableGridSettings, updatedItems);
          onClose();
        } catch (error) {
          console.error("Failed to update LinkGridItem:", error);
        }
      }
      onClose();
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    if (file.size > 1048576) {
      // 1MB limit
      alert("The file is too large. The maximum file size is 1MB.");
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const maxWidth = 800;
      const maxHeight = 600;

      let width = img.width;
      let height = img.height;

      // Calculate the new size maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      setImagePreview(dataUrl); // Update the preview URL

      setEditableLinkGridItem((prev) => {
        if (!prev) return null;
        return { ...prev, imageData: dataUrl.split(",")[1] };
      });
    };

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && event.target.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLinkGridItem = async (itemId: number) => {
    console.log("Deleting item with ID:", itemId);
    if (selectedLinkGridItemId !== null) {
      try {
        await deleteLinkGridItem(itemId);
        setSelectedLinkGridItemId(null);
        onClose();
        window.location.reload(); //reloads the page so that it shows the deleted linkgrid item is not there anymore
      } catch (error) {
        console.error("Error deleting link grid item:", error);
      }
    }
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
          <div className="form-group">
            <div className="select-container">
              <label htmlFor="linkgrid-item-dropdown">
                Select LinkGrid Item to Edit:
              </label>
              <select
                id="linkgrid-item-dropdown"
                value={selectedLinkGridItemId ?? ""}
                onChange={handleDropdownChange}
              >
                <option value="">Select an item</option>
                {linkGridItems.map((item) => (
                  <option key={item.$id} value={item.$id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="inline-group">
              <span className="or-text">Or</span>
              <button className="modal-close-btn" onClick={handleAddNewItem}>
                Add New Item
              </button>
            </div>
          </div>
          {editableLinkGridItem && (
            <div>
              <hr
                style={{
                  height: "2px",
                  backgroundColor: "#cccccc",
                  border: "none",
                }}
              ></hr>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={editableLinkGridItem.title}
                  onChange={handleLinkGridItemChange}
                />
                {!isTitleValid && (
                  <div style={{ color: "red", marginTop: "5px" }}>
                    Title cannot be empty
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Is Active:</label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editableLinkGridItem.isActive}
                  onChange={handleLinkGridItemChange}
                />
              </div>
              <div className="form-group">
                <label>Image:</label>
                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      style={{ maxHeight: "100px" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ width: "calc(100% - 110px)" }}
                />
              </div>
              <div className="form-group">
                <label>Query:</label>
                <input
                  type="text"
                  name="query"
                  value={editableLinkGridItem.query || ""}
                  onChange={handleLinkGridItemChange}
                />
              </div>
              <div className="form-group">
                <label>Categories:</label>
                <Select
                  className="custom-select-class"
                  options={aggregatedOptions}
                  isMulti={true}
                  value={
                    editableLinkGridItem?.categories
                      ? editableLinkGridItem.categories
                          .split(",")
                          .filter((c) => c)
                          .map((category) => ({
                            value: category,
                            label: category,
                          }))
                      : []
                  }
                  onChange={handleCategoriesChange}
                />
              </div>
              <div className="form-group">
                <label>Tags:</label>
                <Select
                  className="custom-select-class"
                  options={tagOptions}
                  isMulti={true}
                  value={initialTagValues}
                  onChange={handleTagsChange}
                />
              </div>
              <div className="delete-linkgrid-btn-container">
                <button
                  type="button"
                  className="delete-linkgrid-btn"
                  onClick={handleDeleteButtonClick}
                >
                  Delete Linkgrid Item
                </button>
              </div>
              <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={handleDeleteConfirmed}
              >
                Are you sure you want to delete the{" "}
                {editableLinkGridItem?.title} link grid item?
              </ConfirmationModal>
            </div>
          )}
          <hr
            style={{
              height: "2px",
              backgroundColor: "#cccccc",
              border: "none",
            }}
          ></hr>
          <h2 style={{ paddingBottom: "10px" }}>Manage Link Grid Settings</h2>
          <div className="form-group">
            <label>Rows: </label>
            <input
              style={{ width: "100%" }}
              type="number"
              min="0"
              value={editableGridSettings.rows}
              onChange={(e) => {
                const newRowValue = Math.max(0, parseInt(e.target.value, 10));
                handleGridSettingsChange({
                  ...editableGridSettings,
                  rows: newRowValue,
                });
              }}
            />
          </div>
          <div className="form-group">
            <label>Columns: </label>
            <input
              style={{ width: "100%" }}
              type="number"
              min="0"
              value={editableGridSettings.columns}
              onChange={(e) => {
                const newRowValue = Math.max(0, parseInt(e.target.value, 10));
                handleGridSettingsChange({
                  ...editableGridSettings,
                  columns: newRowValue,
                });
              }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="modal-close-btn" onClick={onClose}>
            Close
          </button>
          {isTitleValid ? (
            <button
              type="button"
              className="modal-save-btn"
              onClick={handleSaveChanges}
            >
              Save changes
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ManageLinkGridModal;
