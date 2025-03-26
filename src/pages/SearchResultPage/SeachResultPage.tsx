import React, { useEffect, useState } from "react";
// import "../../App.css";
import Filters from "../../components/Filters/Filters";
import SearchInput from "../../components/SearchInput/SearchInput";
import {
  createFilterOption,
  deleteFilterOption,
  fetchFilters,
  updateFilter,
  updateFilterOption,
} from "../../services/FilterService";
import {
  EditableFilterApiItem,
  Filter,
  FilterOption,
} from "../../interfaces/Filters";
import {
  AccessLevel,
  ApiResponse,
  DatabaseApiItem,
  TransformedDataItem,
} from "../../interfaces/DatabaseInterfaces";
import { SearchResultTileProps } from "../../interfaces/SearchResult";
import { deleteDatabase, fetchDatabases } from "../../services/DatabaseService";
import SearchResultTile from "../../components/SearchResult/SearchResult";
import { useRouter } from "next/router"; // Updated for next.js
import { DbCategory } from "../../interfaces/DbCategory";
import { fetchDbCategory } from "../../services/DbCategoryService";

function SearchResultPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const router = useRouter(); // Replacing useLocation and useNavigate with useRouter
  const { query } = router.query; // Extract query from router query parameters

  const [allFilters, setAllFilters] = useState<
    {
      isActive: boolean;
      filterId: number;
      title: string;
      options: FilterOption[];
    }[] 
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(
    new Map(),
  );
  // State for the original list of databases
  const [originalDatabases, setOriginalDatabases] = useState<
    SearchResultTileProps[]
  >([]);
  // State for the filtered list or currently displayed databases
  const [displayedDatabases, setDisplayedDatabases] = useState<
    SearchResultTileProps[]
  >([]);
  const [dbCategoryRelationship, setDbCategoryRelationship] = useState<
    DbCategory[]
  >([]);

  const transformDatabaseApiResonse = (
    apiData: ApiResponse,
  ): TransformedDataItem[] => {
    return apiData.$values.map((item: DatabaseApiItem) => {
      return {
        id: item.databaseID,
        title: item.title,
        author: item.dataCreator,
        access: item.accessLevels.$values
          .map((access: AccessLevel) => access.name)
          .join(", "),
        lastUpdated: new Date(item.lastUpdated).toLocaleDateString(), // Format the date
      };
    });
  };

  const loadDatabases = async () => {
    const databaseResponse = await fetchDatabases();
    const searchResults = transformDatabaseApiResonse(databaseResponse);
    setOriginalDatabases(searchResults);
    setDisplayedDatabases(searchResults);
  };

  const loadFilters = async () => {
    try {
      const filtersDataResponse = (await fetchFilters()) as {
        $values: Filter[];
      };
      const filtersData = filtersDataResponse.$values;

      const allFiltersData = filtersData
        .filter((filter) => filter.isActive) // Only include filters where isActive is true
        .map((filter) => ({
          filterId: filter.filterID,
          isActive: filter.isActive,
          title: filter.filterName,
          options: filter.filterOptions.$values.map((option) => ({
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

  const loadDbCategoryRelationship = async () => {
    try {
      const response = await fetchDbCategory();
      setDbCategoryRelationship(response.$values);
    } catch (error) {
      console.error("Error fetching database-category relationship:", error);
    }
  };

  useEffect(() => {
    setSelectedOptions(new Map());
    const filterParams = new Map();
    if (router.query) {
      Object.entries(router.query).forEach(([key, value]) => {
        if (key !== "query") {
          filterParams.set(key, value?.toString().split(","));
        }
      });
    }
    setSelectedOptions(filterParams);
    loadDbCategoryRelationship();
    loadFilters();
    loadDatabases();
  }, [router.query]);

  const filterDatabases = () => {
    let filteredDatabases = [...originalDatabases];

    if (typeof query === 'string' && query) {
      filteredDatabases = filteredDatabases.filter((db) =>
        db.title.toLowerCase().includes(query.toLowerCase()),
      );
    }

    // Apply filters based on selected options, skipping empty categories
    selectedOptions.forEach((options) => {
      if (options.length > 0) {
        filteredDatabases = filteredDatabases.filter((db) => {
          // Assuming dbCategoryRelationship links db IDs to category names
          const dbCategories = dbCategoryRelationship
            .filter((rel) => rel.databaseID === db.id)
            .map((rel) => rel.optionName);

          return options.every((option) => dbCategories.includes(option));
        });
      }
    });
    setDisplayedDatabases(filteredDatabases);
  };

  useEffect(() => {
    setCurrentPage(0);
    filterDatabases();
  }, [query, originalDatabases, selectedOptions]);

  const displayedItems = displayedDatabases.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const maxPages = Math.ceil(displayedDatabases.length / itemsPerPage);

  const handleSearch = (newQuery: string) => {
    router.push(`/results?query=${encodeURIComponent(newQuery)}`);
  };

  const handleClearSearch = () => {
    router.push("/results");
  };

  const handleSelectedOptionsChange = (filterTitle: string, selected: string[]) => {
    setSelectedOptions((prevSelectedOptions) => {
      const newSelectedOptions = new Map(prevSelectedOptions);
      newSelectedOptions.set(filterTitle, selected);
  
      // Serialize selected filters
      const filterParams = Array.from(newSelectedOptions)
        .filter(([_, value]) => value.length > 0)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value.join(","))}`
        )
        .join("&");
  
   
        // Ensure query is a string, fall back to an empty string if undefined or array
        const finalQuery = typeof query === 'string' ? query : '';

        // Update URL with new filters
        router.push(`/results?query=${encodeURIComponent(finalQuery)}&${filterParams}`, undefined, { shallow: true });

        return newSelectedOptions;
    });
  };

  const handleUpdateChanges = async (
    isActive: boolean,
    filterId: number,
    title: string,
    editedOptions: FilterOption[],
  ) => {
    try {
      const existingOptionsResponse = await fetch(
        `http://localhost:5092/api/filters/${filterId}/options`,
      );
      if (!existingOptionsResponse.ok) {
        throw new Error(
          `Error fetching existing filter options: ${existingOptionsResponse.statusText}`,
        );
      }
      const existingOptionsData = await existingOptionsResponse.json();
      const existingOptionIDs = existingOptionsData.$values.map(
        (option: any) => option.optionId,
      );

      for (const option of editedOptions) {
        if (existingOptionIDs.includes(option.optionId)) {
          // Update existing options
          console.log(
            `Updating filter option with filterId: ${filterId}, optionId: ${option.optionId}, optionName: ${option.optionName}, isActive: ${option.isActive}`,
          );
          await updateFilterOption(
            filterId,
            option.optionId,
            option.optionName,
            option.isActive,
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
            option.isActive,
          );
        }
      }

      const optionsToDelete = existingOptionIDs.filter(
        (optiondId: number) =>
          !editedOptions.some(
            (editedOption) => editedOption.optionId === optiondId,
          ),
      );
      for (const optionId of optionsToDelete) {
        console.log(
          `Deleting filter option with filterId: ${filterId}, optionId: ${optionId}`,
        );

        const optionIdToDelete = existingOptionsData.$values.find(
          (option: any) => option.optionId === optionId,
        )?.optionId;
        if (optionIdToDelete) {
          await deleteFilterOption(optionIdToDelete);
        } else {
          console.error(
            `Failed to find optionId for filter option "${optionId}"`,
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

  const handleDelete = (id: number) => {
    deleteDatabase(id);
    setOriginalDatabases((prevDatabases) =>
      prevDatabases.filter((db) => db.id !== id),
    );
    setDisplayedDatabases((prevDatabases) =>
      prevDatabases.filter((db) => db.id !== id),
    );
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < maxPages - 1 ? prev + 1 : prev));
  };

  return (
    <div className="App">
      <div className="jumbotron">
        <SearchInput handleSearch={handleSearch} />
      </div>
      <div className="content">
        <div className="left-panel">
          {allFilters?.map((filter, index) => (
            <Filters
              key={index}
              filterId={filter.filterId}
              isActive={filter.isActive}
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
        <div className="center-panel">
          <div className="search-header">
            <h4 style={{ fontSize: "18px" }} className="search-title-container">
              {query ? `Results for "${query}"` : "Showing All Databases"}
              {query && (
                <a href="#" onClick={handleClearSearch} className="clear-search-link">
                  Clear
                </a>
              )}
            </h4>
            <button
              onClick={() => router.push("/results/new")}
              className="add-database-button"
            >
              Add Database
            </button>
          </div>
          {displayedItems.map((result, index) => (
            <SearchResultTile
              key={index}
              id={result.id}
              title={result.title}
              author={result.author}
              access={result.access}
              lastUpdated={result.lastUpdated}
              handleDelete={handleDelete}
            />
          ))}
          <br></br><br></br>
          <div className="pagination-controls">
            {displayedDatabases.length > 0 && ( 
            <div className="page-number">
              Showing {currentPage * itemsPerPage + 1} to{" "}
              {Math.min((currentPage + 1) * itemsPerPage, displayedDatabases.length)}{" "}
              of {displayedDatabases.length} Results
            </div>
            )}
            {maxPages > 1 && (
              <div className="pagination-buttons">
                <span>Page {currentPage + 1}/{maxPages}</span>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === maxPages - 1}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResultPage;
