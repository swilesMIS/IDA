import axios from "axios";
import { DbCategory } from "../interfaces/DbCategory";

const API_URL = "http://localhost:5092/api";

export const fetchDbCategory = async () => {
  try {
    const response = await axios.get(`${API_URL}/databasecategories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching DB Categories:", error);
    return { $id: "", $values: [] };
  }
};

export const postDbCategory = async (dbcategory: DbCategory) => {
  try {
    const response = await axios.post(
      `${API_URL}/databasecategories`,
      dbcategory,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Database:", error);
    return {};
  }
};

export const deleteDbCategory = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/databasecategories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error creating Database:", error);
    return {};
  }
};
