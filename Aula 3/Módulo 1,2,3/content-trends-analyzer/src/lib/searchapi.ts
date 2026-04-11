import axios from "axios";

const SEARCH_API_KEY = process.env.SEARCH_API_KEY || "";

export const searchApiClient = axios.create({
  baseURL: "https://www.searchapi.io/api/v1",
  params: {
    api_key: SEARCH_API_KEY,
  },
});
