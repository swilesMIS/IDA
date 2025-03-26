import React, { useEffect, useState } from "react";
// import "../../App.css";
import Filters from "../../components/Filters/Filters";
import SearchInput from "../../components/SearchInput/SearchInput";
import LinkGrid from "../../components/LinkGrid/LinkGrid";
import { LinkGridItem } from "../../interfaces/LinkGridItem";
import {
  fetchFilters,
  createFilter,
  updateFilter,
  createFilterOption,
  deleteFilterOption,
  updateFilterOption,
} from "../../services/FilterService";
import { fetchLinkGridItems } from "../../services/LinkGridItemsService";
import {
  fetchGridSettings,
  updateGridSettings,
} from "../../services/GridSettingsService";
import {
  Filter,
  FilterOption,
  EditableFilterApiItem,
} from "../../interfaces/Filters";
import { useRouter } from "next/router";
import AddFilterModal from "../../components/AdminEditModal/AddFilterModal";
import ManageLinkGridModal from "../../components/ManageLinkGridModal/ManageLinkGridModal";
import { GridSettings } from "../../interfaces/GridSettings";
import { updateLinkGridItem } from "../../services/LinkGridItemsService";
import AddDatasetsModal from "../../components/AdminAddModal/AddDatasetsModal";

function SearchPage() {
  const router = useRouter();  // Replacing useNavigate with useRouter
  const [filterBoxTitle, setFilterBoxTitle] = useState("Add Filter");
  const [allFilters, setAllFilters] = useState<
    {
      isActive: boolean;
      filterId: number;
      title: string;
      options: FilterOption[];
    }[] 
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(
    new Map()
  );
  const [linkGridItems, setLinkGridItems] = useState<LinkGridItem[]>([]);
  const [activeLinkGridItems, setActiveLinkGridItems] = useState<LinkGridItem[]>(
    []
  );
  const [gridSettings, setGridSettings] = useState({
    id: 1,
    rows: 2,
    columns: 3,
  });
  const [showModal, setShowModal] = useState(false);
  const [showLinkGridModal, setShowLinkGridModal] = useState(false);
  const [showAddDatasetModal, setShowAddDatasetModal] = useState(false);

  const handleSearch = (newQuery: string) => {
    // Serialize selected filters
    const filterParams = Array.from(selectedOptions)
      .filter(([value]) => value.length > 0)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value.join(","))}`
      )
      .join("&");

    // Append filters to the URL
    const searchURL = `/results?query=${encodeURIComponent(
      newQuery
    )}&${filterParams}`;
    console.log(`Navigating to: ${searchURL}`);
    router.push(searchURL);  // Replace navigate() with router.push()
  };

  const loadFilters = async () => {
    try {
      const filtersDataResponse = await fetchFilters();
      const filtersData = filtersDataResponse.$values;

      const allFiltersData = filtersData.map((filter: Filter) => ({
        filterId: filter.filterID,
        isActive: filter.isActive,
        title: filter.filterName,
        options: filter.filterOptions.$values.map((option: FilterOption) => ({
          optionId: option.optionId,
          filterID: option.filterID,
          optionName: option.optionName,
          filter: option.filter,
          isActive: option.isActive,
        })),
      }));
      setAllFilters(allFiltersData);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  // Load Link Grid Items
  const loadLinkGridItems = async () => {
    try {
      const itemsResponse = await fetchLinkGridItems();
      const items = itemsResponse.$values;
      setLinkGridItems(items);
      const activeItems = items.filter((item: LinkGridItem) => item.isActive);
      console.log(activeItems);
      setActiveLinkGridItems(activeItems);
    } catch (error) {
      console.error("Error fetching LinkGridItems:", error);
    }
  };

  // Load Grid Settings
  const loadGridSettings = async () => {
    try {
      const settingsResponse = await fetchGridSettings();
      const settings = settingsResponse.$values[0];
      if (settings && settings.rows && settings.columns) {
        setGridSettings({
          id: settings.id,
          rows: settings.rows,
          columns: settings.columns,
        });
      } else {
        console.error("Invalid grid settings received:", settings);
      }
    } catch (error) {
      console.error("Error fetching GridSettings:", error);
    }
  };

  useEffect(() => {
    loadFilters();
    loadLinkGridItems();
    loadGridSettings();
  }, []);

  useEffect(() => {
    // Function to refetch all necessary data
    const refetchData = async () => {
      await loadFilters();
      await loadLinkGridItems();
      await loadGridSettings();
    };

    refetchData();
  }, [router.asPath]);  // Using router.asPath to track URL changes

  const handleSelectedOptionsChange = (
    filterTitle: string,
    selected: string[]
  ) => {
    setSelectedOptions((prevSelectedOptions) => {
      const newSelectedOptions = new Map(prevSelectedOptions);
      newSelectedOptions.set(filterTitle, selected);
      console.log("Selected Filters:", newSelectedOptions);
      return newSelectedOptions;
    });
  };

  async function fetchFilterByName(filterName: string) {
    try {
      // Fetch all filters
      const response = await fetch("http://localhost:5092/api/filters", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching filters: ${response.statusText}`);
      }

      const filtersData = await response.json();
      const allFilters: Filter[] = filtersData.$values;

      // Find the filter by name
      const filter = allFilters.find((f) => f.filterName === filterName);
      if (!filter) {
        throw new Error("Filter not found");
      }

      return filter.filterID;
    } catch (error) {
      console.error("Error in fetchFilterByName:", error);
      throw error;
    }
  }

  const handleSaveWrapper = async (title: string, options: FilterOption[]) => {
    const optionNames = options.map((option) => option.optionName);
    await handleSaveChanges(title, optionNames);
  };

  const handleSaveChanges = async (title: string, options: string[]) => {
    console.log(
      `Received in handleSaveChanges - Title: ${title}, Options: ${options}`
    );

    try {
      const newFilterData: EditableFilterApiItem = {
        filterID: 0,
        filterName: title,
        isActive: true,
        filterOptions: { $values: [] },
      };

      // Step 1: Create the filter
      await createFilter(newFilterData);
      console.log("Filter creation requested");

      // Step 2: Fetch the newly created filter by its name to get the auto-generated ID
      const createdFilterId = await fetchFilterByName(title);
      if (!createdFilterId) {
        throw new Error("Failed to fetch the newly created filter ID");
      }

      console.log(`Fetched filter ID: ${createdFilterId}`);

      // Step 3: Create filter options using the fetched ID
      for (const optionName of options) {
        console.log(
          `Creating filter option with filterId: ${createdFilterId}, optionName: ${optionName}`
        );
        await createFilterOption(createdFilterId, optionName);
      }
      console.log("All filter options created successfully");
    } catch (error) {
      console.error("Error in handleSaveChanges:", error);
    }
    loadFilters();
  };

  const handleUpdateChanges = async (
    isActive: boolean,
    filterId: number,
    title: string,
    editedOptions: FilterOption[]
  ) => {
    try {
      const existingOptionsResponse = await fetch(
        `http://localhost:5092/api/filters/${filterId}/options`
      );
      if (!existingOptionsResponse.ok) {
        throw new Error(
          `Error fetching existing filter options: ${existingOptionsResponse.statusText}`
        );
      }
      const existingOptionsData = await existingOptionsResponse.json();
      const existingOptionIDs = existingOptionsData.$values.map(
        (option: any) => option.optionId
      );

      for (const option of editedOptions) {
        if (existingOptionIDs.includes(option.optionId)) {
          // Update existing options
          console.log(
            `Updating filter option with filterId: ${filterId}, optionId: ${option.optionId}, optionName: ${option.optionName}, isActive: ${option.isActive}`
          );
          await updateFilterOption(
            filterId,
            option.optionId,
            option.optionName,
            option.isActive
          );
        } else {
          // Create new options
          console.log("Creating new option:", {
            filterId,
            optionName: option.optionName,
            isActive: option.isActive,
          });
          await createFilterOption(
            filterId,
            option.optionName,
            option.isActive
          );
        }
      }
      const optionsToDelete = existingOptionIDs.filter(
        (optiondId: number) =>
          !editedOptions.some(
            (editedOption) => editedOption.optionId === optiondId
          )
      );
      for (const optionId of optionsToDelete) {
        console.log(
          `Deleting filter option with filterId: ${filterId}, optionId: ${optionId}`
        );

        const optionIdToDelete = existingOptionsData.$values.find(
          (option: any) => option.optionId === optionId
        )?.optionId;
        if (optionIdToDelete) {
          await deleteFilterOption(optionIdToDelete);
        } else {
          console.error(
            `Failed to find optionId for filter option "${optionId}"`
          );
        }
      }
      console.log("All filter options deleted successfully");

      const updatedFilterData: EditableFilterApiItem = {
        filterID: filterId,
        filterName: title,
        isActive: isActive,
        filterOptions: { $values: [] },
      };
      console.log("Preparing to send update existing:", {
        isActive,
        filterId,
        updatedFilterData,
      });
      await updateFilter(updatedFilterData);

      console.log("Filter updated successfully");
    } catch (error) {
      console.error("Error in handleUpdateChanges:", error);
    }
    loadFilters();
  };

  const maxItems =
    gridSettings.rows && gridSettings.columns
      ? gridSettings.rows * gridSettings.columns
      : 0;

  const displayedLinkGridItems = activeLinkGridItems.slice(0, maxItems);

  const handleGridSettingsSave = async (
    updatedGridSettings: GridSettings,
    updatedLinkGridItems: LinkGridItem[]
  ) => {
    console.log(
      `GridSettingsSave: Updated Link Grid Items:`,
      updatedLinkGridItems
    );
    try {
      // Update the list of all link grid items
      const newLinkGridItems = [...linkGridItems];
      for (const updatedLinkGridItem of updatedLinkGridItems) {
        const searchParams = new URLSearchParams(
          updatedLinkGridItem.url.split("?")[1]
        );
        const index = newLinkGridItems.findIndex(
          (item) => item.id === updatedLinkGridItem.id
        );
        if (
          index !== -1 &&
          JSON.stringify(newLinkGridItems[index]) !==
            JSON.stringify(updatedLinkGridItem)
        ) {
          let updatedURL = `/results?query=${encodeURIComponent(updatedLinkGridItem.query ?? "")}&categories=${encodeURIComponent(updatedLinkGridItem.categories ?? "")}`;

          // Now check if there are any tags and append them correctly
          const tags = searchParams.get("Tags");
          if (tags) {
            updatedURL += `&Tags=${encodeURIComponent(tags)}`;
          }
          newLinkGridItems[index] = {
            ...updatedLinkGridItem,
            url: updatedURL,
          };
          await updateLinkGridItem(
            newLinkGridItems[index].id,
            newLinkGridItems[index]
          );
        }
      }

      // Update the grid settings
      await updateGridSettings(updatedGridSettings);

      // Update the local state to reflect the changes
      setGridSettings(updatedGridSettings);
      setLinkGridItems(newLinkGridItems);

      // Update the active link grid items
      const updatedActiveItems = newLinkGridItems.filter(
        (item) => item.isActive
      );
      setActiveLinkGridItems(updatedActiveItems);

      console.log("LinkGridItems and Grid settings updated successfully");
    } catch (error) {
      console.error("Failed to update LinkGridItems and grid settings:", error);
    }
  };

  const addLinkGridItem = (newItem: LinkGridItem) => {
    console.log("New", newItem);
    setLinkGridItems((prevItems) => [...prevItems, newItem]);
    if (newItem.isActive) {
      setActiveLinkGridItems((prevActiveItems) => [
        ...prevActiveItems,
        newItem,
      ]);
    }
  };

  const handleAddDatasetSave = (sshForm: any, apiForm: any) => {
    console.log("SSH Form:", sshForm);
    console.log("API Form:", apiForm);
    setShowAddDatasetModal(false);
  };

  return (
    <div className="App">
      <div className="jumbotron">
        <SearchInput handleSearch={handleSearch} />
      </div>
      <div className="button-container">
        <button
          className="add-filter-button"
          onClick={() => setShowModal(true)}
        >
          Add Filter
        </button>
        <button
          className="add-linkgrid-button"
          onClick={() => setShowLinkGridModal(true)}
        >
          Manage Linkgrid
        </button>
        <button
          className="add-dataset-button"
          onClick={() => setShowAddDatasetModal(true)}
        >
          Add Dataset
        </button>
      </div>
      <div className="content">
        <div className="left-panel">
          {allFilters.map((filter, index) => (
            <Filters
              filterId={filter.filterId}
              isActive={filter.isActive}
              key={index}
              title={filter.title}
              options={filter.options}
              selectedOptions={selectedOptions.get(filter.title) || []}
              setSelectedOptions={(selected) =>
                handleSelectedOptionsChange(filter.title, selected)
              }
              onSave={handleUpdateChanges}
              onFilterDelete={loadFilters}
            />
          ))}
        </div>
        <LinkGrid gridSettings={gridSettings} links={displayedLinkGridItems} />
      </div>
      {showModal && (
        <AddFilterModal
          title={filterBoxTitle}
          options={[]}
          onClose={() => setShowModal(false)}
          onSave={handleSaveWrapper}
        />
      )}
      {showLinkGridModal && (
        <ManageLinkGridModal
          gridSettings={gridSettings}
          linkGridItems={linkGridItems}
          onClose={() => setShowLinkGridModal(false)}
          onSave={handleGridSettingsSave}
          addLinkGridItem={addLinkGridItem}
          allFilters={allFilters}
        />
      )}
      {showAddDatasetModal && (
        <AddDatasetsModal
          onClose={() => setShowAddDatasetModal(false)}
          onSave={handleAddDatasetSave}
        />
      )}
    </div>
  );
}

export default SearchPage;
