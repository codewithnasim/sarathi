import axios from "axios";

const API_URL = "http://192.168.245.154:5000"; // Change to your backend IP

export const signupUser = async (name, phone, password) => {
  return axios.post(`${API_URL}/signup`, { name, phone, password });
};

export const loginUser = async (phone, password) => {
  return axios.post(`${API_URL}/login`, { phone, password });
};