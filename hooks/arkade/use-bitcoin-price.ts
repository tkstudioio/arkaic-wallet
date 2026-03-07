import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { get } from "lodash";

export type CurrencySymbol =
  | "ARS"
  | "AUD"
  | "BRL"
  | "CAD"
  | "CHF"
  | "CLP"
  | "CNY"
  | "CZK"
  | "DKK"
  | "EUR"
  | "GBP"
  | "HKD"
  | "HRK"
  | "HUF"
  | "INR"
  | "ISK"
  | "JPY"
  | "KRW"
  | "NGN"
  | "NZD"
  | "PLN"
  | "RON"
  | "RUB"
  | "SEK"
  | "SGD"
  | "THB"
  | "TRY"
  | "TWD"
  | "USD";

export type ExchangeRate = {
  "15m": number;
  last: number;
  buy: number;
  sell: number;
  symbol: CurrencySymbol;
};

export default function useBitcoinPrice(symbol: CurrencySymbol) {
  return useQuery({
    queryKey: ["bitcoin-price", symbol],
    refetchInterval: 15 * 60 * 1000, // refetch every 15 minutes
    queryFn: async () => {
      const { data: exchangeRates } = await axios.get<
        Record<CurrencySymbol, ExchangeRate>
      >("https://blockchain.info/ticker");

      const priceInSelectedCurrency = get(exchangeRates, symbol);
      if (!priceInSelectedCurrency) throw new Error("Exchange rate not found");
      return priceInSelectedCurrency;
    },
  });
}
