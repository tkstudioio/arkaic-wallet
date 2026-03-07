import useAccountStore from "@/stores/account";
import { ArkTransaction, TxType } from "@arkade-os/sdk";
import { useQuery } from "@tanstack/react-query";
import { flatMap, orderBy, uniqBy } from "lodash";

function mapCustomVtxoToTransaction(vtxo: {
  txid: string;
  vout: number;
  value: number;
  createdAt: Date;
  virtualStatus: {
    state: "preconfirmed" | "settled" | "swept" | "spent";
    commitmentTxIds?: string[];
  };
  arkTxId?: string;
}): ArkTransaction {
  return {
    key: {
      boardingTxid: "",
      commitmentTxid: vtxo.virtualStatus.commitmentTxIds?.[0] ?? "",
      arkTxid: vtxo.arkTxId || `${vtxo.txid}:${vtxo.vout}`,
    },
    type: TxType.TxReceived,
    amount: vtxo.value,
    settled: vtxo.virtualStatus.state !== "preconfirmed",
    createdAt: vtxo.createdAt.getTime(),
  };
}

export function useTransactions() {
  const { wallet, indexerProvider, account } = useAccountStore();

  return useQuery({
    refetchInterval: 10 * 1000,
    queryKey: ["transactions", wallet?.arkAddress, account?.customVtxoScripts],
    queryFn: async () => {
      if (!wallet) throw new Error("missing wallet");
      const defaultTransactions = await wallet.getTransactionHistory();

      const customScripts = account?.customVtxoScripts ?? [];
      if (!indexerProvider || customScripts.length === 0) {
        return defaultTransactions;
      }

      const responses = await Promise.all(
        customScripts.map((script) => indexerProvider.getVtxos({ scripts: [script] })),
      );

      const customTransactions = flatMap(responses, (response) =>
        response.vtxos.map(mapCustomVtxoToTransaction),
      );

      return orderBy(
        uniqBy(
          [...defaultTransactions, ...customTransactions],
          (transaction) =>
            `${transaction.key.boardingTxid}|${transaction.key.commitmentTxid}|${transaction.key.arkTxid}|${transaction.type}|${transaction.amount}`,
        ),
        (transaction) => transaction.createdAt,
        "desc",
      );
    },
  });
}
