import { ArkaicPayment } from "@/types/arkaic";
import { BitcoinLayer } from "@/types/common";
import { get, replace, split, startsWith, toNumber, toString } from "lodash";
import QueryString from "qs";

export function parserBIP21Address(address: string): ArkaicPayment | undefined {
  if (
    startsWith(address, "bc1") ||
    startsWith(address, "tb1") ||
    startsWith(address, "bcrt1")
  ) {
    return {
      layer: BitcoinLayer.Onchain,
      address: address,
    };
  }

  if (startsWith(address, "tark1")) {
    return {
      layer: BitcoinLayer.Ark,
      address,
    };
  }

  if (!startsWith(address, "bitcoin:")) return;

  const [onchainAddress, params] = split(replace(address, "bitcoin:", ""), "?");
  const parsedParams = QueryString.parse(params);
  const parsedAmount = get(parsedParams, "amount", undefined);
  const amount = toNumber(replace(toString(parsedAmount), ".", ""));
  const arkAddress = get(parsedParams, "ark", undefined);

  if (!arkAddress) {
    return {
      layer: BitcoinLayer.Onchain,
      address: onchainAddress,
      amount,
    };
  }

  return {
    layer: BitcoinLayer.Ark,
    address: toString(arkAddress),
    amount,
  };
}
