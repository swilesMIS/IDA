import React, { useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { format, parseISO } from "date-fns";
import { AccessLevel } from "../../interfaces/DatabaseInterfaces";
import pencilIcon from "../../assets/icons/pencil-fill.svg";
import EditModal from "../EditModal/EditModal";
import { Filter } from "../../interfaces/Filters";
import { fetchDbCategory } from "../../services/DbCategoryService";
import { DbCategory } from "../../interfaces/DbCategory";
import { fetchFilters } from "../../services/FilterService";
import Select, { ActionMeta, MultiValue } from "react-select";

interface AccessLevelContainer {
  $values: AccessLevel[];
}

interface DatabaseApiItem {
  databaseID: number;
  title: string;
  databaseNumber: string;
  lastUpdated: string;
  dataCreator: string;
  description: string;
  accessLevels: AccessLevelContainer;
  eventData: {
    event_date: string;
    event_type: string;
    event_description: string;
    affected_systems: string;
  }[];
}

interface DatabaseInfoTableProps {
  database: DatabaseApiItem;
  isEditing: {
    title: boolean;
    databaseNumber: boolean;
    lastUpdated: boolean;
    dataCreator: boolean;
  };
  setEditing: {
    title: (editing: boolean) => void;
    databaseNumber: (editing: boolean) => void;
    lastUpdated: (editing: boolean) => void;
    dataCreator: (editing: boolean) => void;
  };
  onDatabaseInfoChange: (updatedDatabase: DatabaseApiItem) => void;
  onCategorySelectionChange: (
    selectedCategories: MultiValue<SelectOption>,
  ) => void;
  onTagSelectionChange: (selectedTags: MultiValue<SelectOption>) => void;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const DatabaseInfoTable: React.FC<DatabaseInfoTableProps> = ({
  database,
  onDatabaseInfoChange,
  onCategorySelectionChange,
  onTagSelectionChange,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [inputType, setInputType] = useState<string>("text");
  const [selectOptions, setSelectOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [filtersData, setFiltersData] = useState<Filter[]>([]);
  const [tagOptions, setTagOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<
    MultiValue<SelectOption>
  >([]);
  const [selectedTags, setSelectedTags] = useState<MultiValue<SelectOption>>(
    [],
  );

  useEffect(() => {
    const fetchAndSetFilters = async () => {
      try {
        const filtersDataResponse = await fetchFilters();
        setFiltersData(filtersDataResponse.$values);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchAndSetFilters();
  }, []);

  // This useEffect is responsible for setting the aggregated options
  // once the filters data is fetched and set.
  useEffect(() => {
    if (filtersData.length > 0) {
      const allFiltersData = filtersData.map((filter) => ({
        filterId: filter.filterID,
        isActive: filter.isActive,
        title: filter.filterName,
        options:
          filter.filterOptions?.$values.map((option) => ({
            optionId: option.optionId,
            filterID: option.filterID,
            optionName: option.optionName,
            filter: option.filter,
            isActive: option.isActive,
          })) || [], // Provide a fallback empty array
      }));

      const initialAccumulator: { value: string; label: string }[] = [];

      const aggregatedOptions = allFiltersData.reduce((acc, filter) => {
        if (filter.filterId !== 6) {
          const filterOptions = filter.options.map((option) => ({
            value: option.optionName,
            label: option.optionName,
          }));
          return [...acc, ...filterOptions];
        }
        return acc;
      }, initialAccumulator);

      const tagOptions = allFiltersData
        .filter((filter) => filter.filterId === 6)
        .flatMap((filter) =>
          filter.options.map((option) => ({
            value: option.optionName,
            label: option.optionName,
          })),
        );

      setSelectOptions(aggregatedOptions);
      setTagOptions(tagOptions);
    }
  }, [filtersData]);

  useEffect(() => {
    const loadDbCategoryData = async () => {
      try {
        const dbCategoriesResponse = await fetchDbCategory();
        console.log(dbCategoriesResponse);
        const dbCategories = dbCategoriesResponse.$values;
        const relevantDbCategories = dbCategories.filter(
          (cat: DbCategory) => cat.databaseID === database.databaseID,
        );

        const initialCategoryValues = relevantDbCategories
          .filter(
            (cat: DbCategory) =>
              !tagOptions.find((tag) => tag.label === cat.optionName),
          )
          .map((cat: DbCategory) => ({
            value: cat.optionName,
            label: cat.optionName,
          }));

        const initialTagValues = relevantDbCategories
          .filter((cat: DbCategory) =>
            tagOptions.find((tag) => tag.label === cat.optionName),
          )
          .map((cat: DbCategory) => ({
            value: cat.optionName,
            label: cat.optionName,
          }));

        setSelectedCategories(initialCategoryValues);
        setSelectedTags(initialTagValues);
        onCategorySelectionChange(initialCategoryValues);
        onTagSelectionChange(initialTagValues);
      } catch (error) {
        console.error("Error fetching DB categories:", error);
      }
    };

    if (filtersData.length > 0 && database.databaseID) {
      loadDbCategoryData();
    }
  }, [filtersData, database.databaseID, tagOptions]);

  const startEditing = (
    field: keyof DatabaseApiItem,
    currentValue: string,
    type = "text",
  ) => {
    setEditingField(field);
    setTempValue(currentValue);
    setInputType(type);
  };

  const confirmEdit = () => {
    if (editingField) {
      onDatabaseInfoChange({ ...database, [editingField]: tempValue });
      setEditingField(null);
    }
  };

  const handleCategoryChange = (selectedOptions: MultiValue<SelectOption>) => {
    setSelectedCategories(selectedOptions || []);
    onCategorySelectionChange(selectedOptions);
  };

  const handleTagChange = (selectedOptions: MultiValue<SelectOption>) => {
    setSelectedTags(selectedOptions || []);
    onTagSelectionChange(selectedOptions);
  };

  return (
    <>
      <h2 className="data-header">Database Details</h2>
      <table className="database-info">
        <tbody>
          <tr>
            <th>Title:</th>
            <td>
              <span>{database.title}</span>
              <img
                className="edit-icon"
                style={{ float: "right" }}
                src={pencilIcon}
                alt="Edit Title"
                onClick={() => startEditing("title", database.title)}
              />
            </td>
          </tr>
          <tr>
            <th>Database Number:</th>
            <td>
              <span>{database.databaseNumber}</span>
              <img
                className="edit-icon"
                style={{ float: "right" }}
                src={pencilIcon}
                alt="Edit Database Number"
                onClick={() =>
                  startEditing("databaseNumber", database.databaseNumber)
                }
              />
            </td>
          </tr>
          <tr>
            <th>Last Updated:</th>
            <td>
              <span>
                {format(parseISO(database.lastUpdated), "MMMM dd, yyyy")}
              </span>
              <img
                className="edit-icon"
                style={{ float: "right" }}
                src={pencilIcon}
                alt="Edit Last Updated"
                onClick={() =>
                  startEditing(
                    "lastUpdated",
                    format(parseISO(database.lastUpdated), "yyyy-MM-dd"),
                    "date",
                  )
                }
              />
            </td>
          </tr>
          <tr>
            <th>Data Creator(s):</th>
            <td>
              <span>{database.dataCreator}</span>
              <img
                className="edit-icon"
                style={{ float: "right" }}
                src={pencilIcon}
                alt="Edit Data Creator(s)"
                onClick={() =>
                  startEditing("dataCreator", database.dataCreator)
                }
              />
            </td>
          </tr>
          <tr>
            <th>Categories:</th>
            <td>
              <Select
                value={selectedCategories}
                options={selectOptions}
                onChange={handleCategoryChange}
                isMulti={true}
                isClearable={true}
                placeholder="Select Category..."
              />
            </td>
          </tr>
          <tr>
            <th>Tags:</th>
            <td>
              <Select
                value={selectedTags}
                options={tagOptions}
                onChange={handleTagChange}
                isMulti={true}
                isClearable={true}
                placeholder="Select Tags..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      <EditModal
        isOpen={editingField !== null}
        onClose={() => setEditingField(null)}
        onConfirm={confirmEdit}
      >
        {editingField === "title" && (
          <TextareaAutosize
            className="modal-textarea"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
        )}
        {editingField === "databaseNumber" && (
          <TextareaAutosize
            className="modal-textarea"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
        )}
        {editingField === "lastUpdated" && inputType === "date" && (
          <input
            type="date"
            className="modal-input"
            value={format(parseISO(tempValue), "yyyy-MM-dd")}
            onChange={(e) => setTempValue(e.target.value)}
          />
        )}
        {editingField === "dataCreator" && (
          <TextareaAutosize
            className="modal-textarea"
            maxRows={2}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
        )}
      </EditModal>
    </>
  );
};
