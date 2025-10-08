import { BitcoinLayer } from "./common";

export type ArkaicProfile = {
  name: string;
  privateKey: string;
  arkadeServerUrl: string;
  avatar?: string;
};

export type ArkaicPayment = {
  layer: BitcoinLayer;
  address: string;
  signerPubkey?: string;
  amount?: number;
};
