import useAccountStore from "@/stores/account";
import { TapLeafScript } from "@arkade-os/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hex } from "@scure/base";

export type SweepCustomVtxoInput = {
  txid: string;
  vout: number;
  value: number;
  tapTreeHex: string;
  forfeitControlBlockHex: string;
  forfeitScriptHex: string;
  intentControlBlockHex?: string;
  intentScriptHex?: string;
  tapLeafVersion?: number;
  extraWitnessHex?: string[];
};

export type SweepCustomVtxosParams = {
  inputs: SweepCustomVtxoInput[];
  destinationArkAddress?: string;
  amountSats?: bigint;
};

function asTapLeafScript(
  controlBlockHex: string,
  scriptHex: string,
  tapLeafVersion = 0xc0,
): TapLeafScript {
  const controlBlock = hex.decode(controlBlockHex);
  const script = hex.decode(scriptHex);
  return [controlBlock, new Uint8Array([...script, tapLeafVersion])];
}

function toWalletInput(input: SweepCustomVtxoInput) {
  const forfeitTapLeafScript = asTapLeafScript(
    input.forfeitControlBlockHex,
    input.forfeitScriptHex,
    input.tapLeafVersion,
  );

  const intentTapLeafScript = asTapLeafScript(
    input.intentControlBlockHex ?? input.forfeitControlBlockHex,
    input.intentScriptHex ?? input.forfeitScriptHex,
    input.tapLeafVersion,
  );

  return {
    txid: input.txid,
    vout: input.vout,
    value: input.value,
    tapTree: hex.decode(input.tapTreeHex),
    forfeitTapLeafScript,
    intentTapLeafScript,
    extraWitness: input.extraWitnessHex?.map((item) => hex.decode(item)),
  };
}

export function useSweepCustomVtxos() {
  const { wallet } = useAccountStore();
  const queryClient = useQueryClient();

  return useMutation<string, Error, SweepCustomVtxosParams>({
    mutationKey: ["sweep-custom-vtxos"],
    mutationFn: async ({ inputs, destinationArkAddress, amountSats }) => {
      if (!wallet) throw new Error("missing wallet");
      if (inputs.length === 0) throw new Error("missing custom inputs");

      const destination = destinationArkAddress ?? (await wallet.getAddress());
      const totalAmount =
        amountSats ??
        BigInt(inputs.reduce((sum, current) => sum + current.value, 0));

      if (totalAmount <= 0n) throw new Error("invalid sweep amount");

      const walletInputs = inputs.map(toWalletInput);

      return wallet.settle({
        // SDK typing is narrow (ExtendedCoin[]), but settle runtime supports
        // any input shape with txid/vout/value/tap fields used during signing.
        inputs: walletInputs as never,
        outputs: [
          {
            address: destination,
            amount: totalAmount,
          },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["vtxos"] });
      queryClient.invalidateQueries({ queryKey: ["custom-script-vtxos"] });
    },
  });
}
