import axios from "axios";
import { GridSettings } from "../interfaces/GridSettings";

const API_URL = "http://localhost:5092/api";

export const fetchGridSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/GridSettings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching GridSettings:", error);
    return {};
  }
};

export const updateGridSettings = async (settings: GridSettings) => {
  try {
    const response = await axios.put(`${API_URL}/gridsettings`, settings);
    return response.data;
  } catch (error) {
    console.error("Error updating GridSettings:", error);
    throw error;
  }
};
