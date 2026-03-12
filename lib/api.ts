import axios, { AxiosError } from "axios";

export const API_BASE_URL = "http://localhost:4000/v2";

export const backend = axios.create({
  baseURL: API_BASE_URL,
});

backend.interceptors.request.use(async (config) => {
  return config;
});

backend.interceptors.response.use(
  function onFulfilled(response) {
    return response;
  },
  async function onRejected(error: AxiosError<{ error: string }>) {
    return Promise.reject(error);
  },
);
