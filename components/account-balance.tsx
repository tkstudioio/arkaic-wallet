import { useBalance } from "@/hooks/use-balance";

import { useWallet } from "@/hooks/use-wallet";
import { ArkaicProfile } from "@/types/arkaic";

import useBitcoinPrice from "@/hooks/use-bitcoin-price";
import { match } from "ts-pattern";
import { AmountComponent } from "./amount";
import { Heading } from "./ui/heading";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

import useSettingsStore from "@/stores/settings";

export function AccountBalance(props: { profile: ArkaicProfile }) {
  const { data: wallet } = useWallet(props.profile);
  const balanceQuery = useBalance(wallet);
  const { symbol } = useSettingsStore();
  const { data: exchangeData } = useBitcoinPrice(symbol);

  return match(balanceQuery)
    .with(
      { isFetching: true },
      { isLoading: true },
      { isPending: true },
      () => <Spinner />
    )
    .with({ isSuccess: true }, ({ data }) => (
      <>
        <AmountComponent
          amount={data?.available}
          size='5xl'
          exchangeRate={exchangeData}
        />
        <AmountComponent
          amount={data?.available + data.boarding.total}
          size='2xl'
          exchangeRate={exchangeData}
        />
      </>
    ))
    .otherwise(({ error }) => (
      <VStack className='items-center' space={"md"}>
        <VStack className='items-center'>
          <Heading>Failed to fetch balance</Heading>
          <Text>
            {error?.message} {error?.stack}
          </Text>
          <Text>{error?.stack}</Text>
        </VStack>
      </VStack>
    ));
}
