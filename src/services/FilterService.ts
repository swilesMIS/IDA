import axios from "axios";
import { EditableFilterApiItem } from "../interfaces/Filters";

const API_URL = "http://localhost:5092/api";

export const fetchFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/filters`);
    return response.data;
  } catch (error) {
    console.error("Error fetching filters:", error);
    return {};
  }
};

export const createFilter = async (filter: EditableFilterApiItem) => {
  try {
    const response = await axios.post(`${API_URL}/filters`, filter);
    return response.data;
  } catch (error) {
    console.error("Error creating filter:", error);
    return null;
  }
};

export const updateFilter = async (filter: EditableFilterApiItem) => {
  try {
    const response = await axios.put(`${API_URL}/filters/`, filter);
    return response.data;
  } catch (error) {
    console.error("Error updating filter:", error);
    return null;
  }
};

export const deleteFilter = async (filterId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/Filters/${filterId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting filter option:", error);
    return null;
  }
};

export const fetchFilterOptions = async (filterId: number) => {
  try {
    const response = await axios.get(`${API_URL}/filters/${filterId}/options`);
    return response.data;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return [];
  }
};

export const createFilterOption = async (
  filterId: number,
  optionName: string,
  isActive = true,
) => {
  try {
    const filterOptionData = { filterId, optionName, isActive };
    const response = await axios.post(
      `${API_URL}/Filters/filterOptions`,
      filterOptionData,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating filter option:", error);
    return null;
  }
};

export const updateFilterOption = async (
  filterId: number,
  optionId: number,
  optionName: string,
  isActive: boolean,
) => {
  try {
    const filterOptionData = {
      optionId: optionId,
      filterId: filterId,
      optionName: optionName,
      isActive: isActive,
    };
    const response = await axios.put(
      `${API_URL}/Filters/filterOptions`,
      filterOptionData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating filter option:", error);
    return null;
  }
};

export const deleteFilterOption = async (optionId: number) => {
  try {
    const response = await axios.delete(
      `${API_URL}/Filters/filterOptions/${optionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting filter option:", error);
    return null;
  }
};
