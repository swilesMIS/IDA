"use client";
import { useState } from 'react';
import Link from 'next/link';

const AddTagButton = () => {
  const [isOpen, setIsOpen] = useState(false);  // To toggle the tag creation form
  const [newTag, setNewTag] = useState('');     // To store the input value for the tag

  // Function to handle when the "Add Tag" button is clicked
  const handleAddTagClick = () => {
    setIsOpen(!isOpen);  // Toggle form visibility
  };

  // Function to handle form input change
  const handleInputChange = (e) => {
    setNewTag(e.target.value);
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTag) {
      console.log('New tag created:', newTag);
      // Here, you can add your logic to save the tag (e.g., an API call or saving to local state)
      setNewTag(''); // Clear input after creating the tag
      setIsOpen(false); // Close the form
    }
  };

  return (
    <div className='flex md:gap-5'>
      <button href="/create-prompt" className='black_btn' onClick={handleAddTagClick}>
        Add Tag
      </button>

      {/* Create Tag Form */}
      {isOpen && (
        <div className="tag-form">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <input
              type="text"
              placeholder="Enter new tag"
              value={newTag}
              onChange={handleInputChange}
              className="input-field"
            />
            <button type="submit" className="black_btn">
              Create Tag
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddTagButton;
