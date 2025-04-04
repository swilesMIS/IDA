import React from "react";
import "../styles/App.css";
import "../styles/index.css";
import "../styles/ConfirmationModal.css";
import "../styles/Filters.css";
import "../styles/AdminEditModal.css";
import "../styles/AddDatasetsModal.css";
import "../styles/Form.css";
import "../styles/DetailedResultPage.css";
import "../styles/EditModal.css";
import "../styles/SearchResultPage.css";
import "../styles/SearchResult.css";
import SearchPage from './SearchPage/SearchPage';
import DetailedResultPage from './DetailedResultPage/DetailedResultPage';
import SearchResultPage from './SearchResultPage/SeachResultPage'; 
import StartPage from './index'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Page routes are automatically handled based on the pages directory */}
        <SearchResultPage />
      </header>
    </div>
  );
}

export default App;
