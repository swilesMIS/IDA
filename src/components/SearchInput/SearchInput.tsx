// SearchInput.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// Define an interface for the component props
interface SearchInputProps {
  handleSearch: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ handleSearch }) => {
  const [localQuery, setLocalQuery] = useState("");

  const onSearchClick = () => {
    handleSearch(localQuery); // Pass the localQuery to parent's handleSearch
  };
  return (
    <div className="search-input-container">
      <FontAwesomeIcon
        icon={faSearch}
        style={{ fontSize: "20px", paddingLeft: "10px" }}
      />
      <input
        type="text"
        placeholder="Search our data repository"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        style={{ fontFamily: "Arial, 'Font Awesome 5 Free'" }}
      />
      <button onClick={onSearchClick}>Search</button>
    </div>
  );
};

export default SearchInput;
