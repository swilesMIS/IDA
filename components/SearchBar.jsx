"use client";

import { useState } from 'react';

const SearchBar = ({ data, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Pass query to parent component
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
        style={{
          padding: '8px',
          fontSize: '1rem',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '1rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      />
    </div>
  );
};

export default SearchBar;
