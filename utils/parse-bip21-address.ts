import { ArkaicPayment } from "@/types/arkaic";
import { get, replace, split, startsWith, toNumber, toString } from "lodash";
import QueryString from "qs";

export function parserBIP21Address(address: string): ArkaicPayment | undefined {
  if (
    startsWith(address, "bc1") ||
    startsWith(address, "tb1") ||
    startsWith(address, "bcrt1")
  ) {
    return {
      onchainAddress: address,
    };
  }

  if (startsWith(address, "tark1")) {
    return {
      arkAddress: address,
    };
  }

  if (!startsWith(address, "bitcoin:")) return;

  const [onchainAddress, params] = split(replace(address, "bitcoin:", ""), "?");
  const parsedParams = QueryString.parse(params);
  const parsedAmount = get(parsedParams, "amount", undefined);
  const amount = toNumber(replace(toString(parsedAmount), ".", ""));
  const arkAddress = get(parsedParams, "ark", undefined);

  if (!arkAddress) {
    return { onchainAddress, amount };
  }
  const parsedSignerPubkey = get(parsedParams, "signerPubkey", undefined);

  return {
    arkAddress: toString(arkAddress),
    onchainAddress,
    signerPubkey: parsedSignerPubkey ? toString(parsedSignerPubkey) : undefined,
    amount,
  };
}
