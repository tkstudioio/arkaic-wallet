import useAccountStore from "@/stores/account";
import { mnemonicToPrivateKey } from "@/utils/mnemonic";
import { schnorr } from "@noble/curves/secp256k1";
import { hex } from "@scure/base";
import axios, { AxiosError } from "axios";

export const API_BASE_URL = "http://localhost:4000/api";

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
    if (config.data instanceof FormData) return config;

    if (!config.data) config.data = {};

    const sortedData = Object.keys(config.data)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = config.data[key];
          return acc;
        },
        {} as Record<string, unknown>,
      );

    const payload = new TextEncoder().encode(JSON.stringify(sortedData));

    if (!account?.mnemonic) throw new Error("missing mnemonic");

    const privateKey = mnemonicToPrivateKey(account?.mnemonic);

    const signature = hex.encode(schnorr.sign(payload, hex.decode(privateKey)));

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
