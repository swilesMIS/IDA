import axios from "axios";
import { LinkGridItem } from "../interfaces/LinkGridItem";

const API_URL = "http://localhost:5092/api";

export const fetchLinkGridItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/LinkGridItems`);
    return response.data;
  } catch (error) {
    console.error("Error fetching LinkGridItems:", error);
    return [];
  }
};

export const updateLinkGridItem = async (
  id: number,
  itemData: LinkGridItem,
) => {
  try {
    const response = await axios.put(
      `${API_URL}/LinkGridItems/${id}`,
      itemData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating LinkGridItem:", error);
    throw error;
  }
};

export const createLinkGridItem = async (itemData: LinkGridItem) => {
  try {
    const response = await axios.post(`${API_URL}/LinkGridItems`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error creating LinkGridItem:", error);
    throw error;
  }
};

export const deleteLinkGridItem = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/LinkGridItems/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting LinkGridItem:", error);
    throw error;
  }
};
