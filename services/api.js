import axios from "axios";
import { API_URL } from "../config.js";
// Change to your backend IP

export const signupUser = async (name, phone, password) => {
  return axios.post(`${API_URL}/signup`, { name, phone, password });
};

export const loginUser = async (phone, password) => {
  return axios.post(`${API_URL}/login`, { phone, password });
};
