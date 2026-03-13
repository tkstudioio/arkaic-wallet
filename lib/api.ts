import useAccountStore from "@/stores/account";
import { schnorr } from "@noble/curves/secp256k1";
import { hex } from "@scure/base";
import axios, { AxiosError } from "axios";

export const API_BASE_URL = "http://localhost:4000/v2";

export const backend = axios.create({
  baseURL: API_BASE_URL,
});

backend.interceptors.request.use(async (config) => {
  const { getState } = useAccountStore;

  const { token, account } = getState();

  const isAuthRoute = config.url?.startsWith("/auth/");

  if (!token || isAuthRoute) return config;

  config.headers.Authorization = `Bearer ${token}`;

  const method = config.method?.toUpperCase();

  if (method === "POST" || method === "PUT" || method === "PATCH") {
    const payload = new TextEncoder().encode(JSON.stringify(config.data));

    if (!account?.privateKey) return config;

    const signature = hex.encode(
      schnorr.sign(payload, hex.decode(account?.privateKey)),
    );

    config.data.signature = signature;
  }

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
