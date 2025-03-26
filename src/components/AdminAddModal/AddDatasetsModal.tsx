import React, { useState } from "react";
// import "../AdminEditModal/AdminEditModal.css";
// import "./AddDatasetsModal.css";

interface AddDatasetsModalProps {
  onClose: () => void;
  onSave: (sshForm: SSHForm, apiForm: APIForm) => void;
}

interface SSHForm {
  datasetName: string;
  hostname: string;
  port: string;
  username: string;
  authMethod: string;
  directoryPath: string;
}

interface APIForm {
  datasetName: string;
  url: string;
  headers: string;
  queryParams: string;
  requestBody: string;
  authDetails: string;
}

const AddDatasetsModal: React.FC<AddDatasetsModalProps> = ({
  onClose,
  onSave,
}) => {
  const [sshForm, setSshForm] = useState({
    datasetName: "",
    hostname: "",
    port: "",
    username: "",
    authMethod: "",
    directoryPath: "",
  });

  const [apiForm, setApiForm] = useState({
    datasetName: "",
    url: "",
    headers: "",
    queryParams: "",
    requestBody: "",
    authDetails: "",
  });

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setForm: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const { name, value } = event.target;
    setForm((prevState: SSHForm | APIForm) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent, formType: "ssh" | "api") => {
    e.preventDefault();
    if (formType === "ssh") {
      console.log("SSH Form Submitted:", sshForm);
      onSave(sshForm, apiForm);
    } else {
      console.log("API Form Submitted:", apiForm);
      onSave(sshForm, apiForm);
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
          <div className="form-container">
            <div className="form-side">
              <h2 className="dataset-form-header">SSH Dataset</h2>
              <form
                className="dataset-form"
                onSubmit={(e) => handleSubmit(e, "ssh")}
              >
                <label className="dataset-label">Dataset Name</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="datasetName"
                  value={sshForm.datasetName}
                  onChange={(e) => handleFormChange(e, setSshForm)}
                />
                <label className="dataset-label">Hostname</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="hostname"
                  value={sshForm.hostname}
                  onChange={(e) => handleFormChange(e, setSshForm)}
                />
                <label className="dataset-label">Port</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="port"
                  value={sshForm.port}
                  onChange={(e) => handleFormChange(e, setSshForm)}
                />
                <label className="dataset-label">Username</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="username"
                  value={sshForm.username}
                  onChange={(e) => handleFormChange(e, setSshForm)}
                />
                <label className="dataset-label">Authentication Method</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="authMethod"
                  value={sshForm.authMethod}
                  onChange={(e) => handleFormChange(e, setSshForm)}
                />
                <label className="dataset-label">Directory Path</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="directoryPath"
                  value={sshForm.directoryPath}
                  onChange={(e) => handleFormChange(e, setSshForm)}
                />
                <button className="dataset-submit">Submit</button>
              </form>
            </div>
            <div className="form-side">
              <h2 className="dataset-form-header">API Dataset</h2>
              <form
                className="dataset-form"
                onSubmit={(e) => handleSubmit(e, "api")}
              >
                <label className="dataset-label">Dataset Name</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="datasetName"
                  value={apiForm.datasetName}
                  onChange={(e) => handleFormChange(e, setApiForm)}
                />
                <label className="dataset-label">URL</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="url"
                  value={apiForm.url}
                  onChange={(e) => handleFormChange(e, setApiForm)}
                />
                <label className="dataset-label">Request Headers</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="headers"
                  value={apiForm.headers}
                  onChange={(e) => handleFormChange(e, setApiForm)}
                />
                <label className="dataset-label">Query Parameters</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="queryParams"
                  value={apiForm.queryParams}
                  onChange={(e) => handleFormChange(e, setApiForm)}
                />
                <label className="dataset-label">Request Body</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="requestBody"
                  value={apiForm.requestBody}
                  onChange={(e) => handleFormChange(e, setApiForm)}
                />
                <label className="dataset-label">Authentication Details</label>
                <input
                  className="dataset-input"
                  type="text"
                  name="authDetails"
                  value={apiForm.authDetails}
                  onChange={(e) => handleFormChange(e, setApiForm)}
                />
                <button className="dataset-submit" type="submit">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDatasetsModal;
