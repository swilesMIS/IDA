import axios from "axios";
import { EditableDatabaseApiItem } from "../interfaces/DatabaseInterfaces";

const API_URL = "http://localhost:5092";

export const fetchDatabases = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/Databases`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Databases:", error);
    return {};
  }
};

export const fetchDatabase = async (id: string | undefined) => {
  try {
    const response = await axios.get(`${API_URL}/api/Databases/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Database:", error);
    return {};
  }
};

export const createDatabase = async (database: EditableDatabaseApiItem) => {
  try {
    const response = await axios.post(`${API_URL}/api/Databases`, database);
    return response.data;
  } catch (error) {
    console.error("Error creating Database:", error);
    return {};
  }
};

export const updateDatabase = async (database: EditableDatabaseApiItem) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/Databases/${database.databaseID}`,
      database,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Database:", error);
    return {};
  }
};

export const deleteDatabase = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/Databases/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Database:", error);
    return {};
  }
};
