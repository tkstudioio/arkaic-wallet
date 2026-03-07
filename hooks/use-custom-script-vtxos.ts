import useAccountStore from "@/stores/account";
import { useQuery } from "@tanstack/react-query";

type UseCustomScriptVtxosParams = {
  scriptPubKeyHex?: string;
  enabled?: boolean;
};

export function useCustomScriptVtxos({
  scriptPubKeyHex,
  enabled = true,
}: UseCustomScriptVtxosParams) {
  const { indexerProvider } = useAccountStore();

  return useQuery({
    queryKey: ["custom-script-vtxos", scriptPubKeyHex],
    enabled: Boolean(indexerProvider && scriptPubKeyHex && enabled),
    queryFn: async () => {
      if (!indexerProvider) throw new Error("missing indexer provider");
      if (!scriptPubKeyHex) throw new Error("missing custom script");
      const { vtxos } = await indexerProvider.getVtxos({
        scripts: [scriptPubKeyHex],
      });
      return vtxos;
    },
  });
}
