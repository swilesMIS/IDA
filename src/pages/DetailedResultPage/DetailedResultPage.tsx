import React, { useEffect, useState } from "react";
import { createDatabase, fetchDatabase } from "../../services/DatabaseService";
import { useRouter } from "next/router"; // Next.js hook for routing
import { updateDatabase } from "../../services/DatabaseService";
import {
  fetchDbCategory,
  postDbCategory,
  deleteDbCategory,
} from "../../services/DbCategoryService";
import { EditableDatabaseApiItem } from "../../interfaces/DatabaseInterfaces";
import { AccessLevel } from "../../interfaces/DatabaseInterfaces";
import { AccessLevelEditor } from "../../components/DetailedResultPage/AccessLevelEditor";
import { DatabaseInfoTable } from "../../components/DetailedResultPage/DatabaseInfoTable";
import { DescriptionEditor } from "../../components/DetailedResultPage/DecriptionEditor";
import { MultiValue } from "react-select";
import { SelectOption } from "../../components/DetailedResultPage/DatabaseInfoTable";
import { DbCategory } from "../../interfaces/DbCategory";
import ConfirmationModal from "../../components/CofirmationModal/ConfirmationModal";

interface AccessLevelContainer {
  $values: AccessLevel[];
}

export interface DatabaseApiItem {
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

const DetailedResultPage: React.FC = () => {
  const [database, setDatabase] = useState<DatabaseApiItem | null>(null);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [editingDatabaseNumber, setEditingDatabaseNumber] = useState<boolean>(false);
  const [editingLastUpdated, setEditingLastUpdated] = useState<boolean>(false);
  const [editingDataCreator, setEditingDataCreator] = useState<boolean>(false);
  const [editingAccessLevelIndex, setEditingAccessLevelIndex] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageMode, setPageMode] = useState<"create" | "edit">("edit");
  const [selectedCategories, setSelectedCategories] = useState<MultiValue<SelectOption>>([]);
  const [selectedTags, setSelectedTags] = useState<MultiValue<SelectOption>>([]);
  const [initialCategories, setInitialCategories] = useState<MultiValue<SelectOption>>([]);
  const [initialTags, setInitialTags] = useState<MultiValue<SelectOption>>([]);

  const router = useRouter(); // Next.js hook to access route parameters
  const { id } = router.query; // Access dynamic route parameter (e.g. /results/[id])

  const newDatabaseTemplate: DatabaseApiItem = {
    databaseID: 0,
    title: "Template Title",
    databaseNumber: "Template Database Number",
    lastUpdated: new Date().toISOString(),
    dataCreator: "Template Creator",
    description: "Template Description",
    accessLevels: {
      $values: [
        {
          accessLevelID: 0,
          name: "Open Access Data",
          description: "Template Access Level Description",
          id: 0,
        },
        {
          accessLevelID: 1,
          name: "Safeguarded Data",
          description: "Template Access Level 2 Description",
          id: 1,
        },
      ],
    },
    eventData: [],
  };

  useEffect(() => {
    if (id === "new") {
      setPageMode("create");
      setDatabase(newDatabaseTemplate);
    } else if (id) {
      setPageMode("edit");
      const getDatabase = async () => {
        try {
          const databaseResponse = await fetchDatabase(id as string); // `id` is now a string
          setDatabase(databaseResponse);
        } catch (error) {
          console.error("Failed to fetch database", error);
        }
      };

      getDatabase();
    }
  }, [id]); // Re-run when the route parameter `id` changes

  if (!database) {
    return <div>Loading...</div>;
  }

  const startEditingAccessLevel = (index: number) => {
    setEditingAccessLevelIndex(index);
  };

  // Function to stop editing an access level
  const stopEditingAccessLevel = () => {
    setEditingAccessLevelIndex(null);
  };

  const handleAccessLevelUpdate = (index: number, updatedLevel: AccessLevel) => {
    const updatedAccessLevels = [...database.accessLevels.$values];
    updatedAccessLevels[index] = updatedLevel;
    setDatabase({
      ...database,
      accessLevels: { ...database.accessLevels, $values: updatedAccessLevels },
    });
  };

  const handleDescriptionChange = (updatedDescription: string) => {
    setDatabase((prevDatabase) => {
      if (!prevDatabase) return null;
      return { ...prevDatabase, description: updatedDescription };
    });
  };

  const handleUpdate = async () => {
    const editableDatabase: EditableDatabaseApiItem = {
      databaseID: database.databaseID,
      title: database.title,
      databaseNumber: database.databaseNumber,
      lastUpdated: database.lastUpdated,
      dataCreator: database.dataCreator,
      description: database.description,
      accessLevels: database.accessLevels.$values,
    };

    let newDatabaseID = database?.databaseID;

    try {
      if (pageMode === "create") {
        const newDatabaseResponse = await createDatabase(editableDatabase);
        newDatabaseID = newDatabaseResponse.databaseID;
      } else {
        await updateDatabase(editableDatabase);
      }

      if (!selectedTags.length && initialTags.length) {
        setSelectedTags(initialTags);
      }
      if (!selectedCategories.length && initialCategories.length) {
        setSelectedCategories(initialCategories);
      }
      const allSelectedOptions = [...selectedCategories, ...selectedTags];

      const dbCategoriesResponse = await fetchDbCategory();
      const currentDbCategories = dbCategoriesResponse.$values.filter(
        (cat: DbCategory) => cat.databaseID === newDatabaseID
      );

      const currentCategoryNames = new Set(
        currentDbCategories.map((cat: DbCategory) => cat.optionName)
      );

      const categoriesToAdd = allSelectedOptions.filter(
        (cat) => !currentCategoryNames.has(cat.label)
      );
      categoriesToAdd.forEach(async (cat: SelectOption) => {
        const newCategory: DbCategory = {
          $id: "",
          db_categoryID: 0,
          databaseID: newDatabaseID,
          optionName: cat.label,
        };
        await postDbCategory(newCategory);
      });

      const categoriesToRemove = currentDbCategories.filter(
        (cat: DbCategory) =>
          !allSelectedOptions.some(
            (selected) => selected.label === cat.optionName
          )
      );
      for (const cat of categoriesToRemove) {
        await deleteDbCategory(cat.db_categoryID);
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to update database details", error);
    }
  };

  const handleCategorySelectionChange = (
    selectedCategories: MultiValue<SelectOption>
  ) => {
    setSelectedCategories(selectedCategories);
  };

  const handleTagSelectionChange = (selectedTags: MultiValue<SelectOption>) => {
    if (!selectedTags.length) {
      setInitialTags(initialTags);
    }
    setSelectedTags(selectedTags);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="detailed-result-page">
      <div className="title-section">
        <h1 className="title-text">{database.title}</h1>
        <DescriptionEditor
          description={database.description}
          onDescriptionChange={handleDescriptionChange}
        />
      </div>
      <div className="content-background">
        <div className="main-content">
          {/* Access Levels Container */}
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "0",
              flex: "1 1 auto",
              maxWidth: "calc(50% - 20px)",
              boxSizing: "border-box",
            }}
          >
            <AccessLevelEditor
              accessLevels={database.accessLevels?.$values}
              onUpdate={handleAccessLevelUpdate}
              editingAccessLevelIndex={editingAccessLevelIndex}
              startEditingAccessLevel={startEditingAccessLevel}
              stopEditingAccessLevel={stopEditingAccessLevel}
            />
          </div>

          {/* Database Details Container */}
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "0",
              flex: "1 1 auto",
              maxWidth: "calc(50% - 20px)",
              boxSizing: "border-box",
            }}
          >
            <DatabaseInfoTable
              database={database}
              isEditing={{
                title: editingTitle,
                databaseNumber: editingDatabaseNumber,
                lastUpdated: editingLastUpdated,
                dataCreator: editingDataCreator,
              }}
              setEditing={{
                title: setEditingTitle,
                databaseNumber: setEditingDatabaseNumber,
                lastUpdated: setEditingLastUpdated,
                dataCreator: setEditingDataCreator,
              }}
              onDatabaseInfoChange={setDatabase}
              onCategorySelectionChange={handleCategorySelectionChange}
              onTagSelectionChange={handleTagSelectionChange}
            />
          </div>
        </div>
      </div>
      <button onClick={handleUpdate}>Save Changes</button>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        showConfirmButton={false}
        closeButtonText="Confirm"
      >
        Successfully saved changes to the {database.title} database.
      </ConfirmationModal>
    </div>
  );
};

export default DetailedResultPage;
