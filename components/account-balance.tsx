import { useBalance } from "@/hooks/use-balance";

import { useWallet } from "@/hooks/use-wallet";
import { ArkaicAccount } from "@/types/arkaic";

import useBitcoinPrice from "@/hooks/use-bitcoin-price";

import useSettingsStore from "@/stores/settings";
import { match } from "ts-pattern";
import { AmountComponent } from "./amount";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function AccountBalance(props: { account: ArkaicAccount }) {
  const { data: wallet } = useWallet(props.account);
  const balanceQuery = useBalance(wallet);
  const { symbol } = useSettingsStore();
  const { data: exchangeData } = useBitcoinPrice(symbol);

  return match(balanceQuery)
    .with(
      { isFetching: true },
      { isLoading: true },
      { isPending: true },
      () => (
        <>
          <VStack className='justify-around h-full items-end'>
            <Skeleton className='h-20' />
            <Skeleton className='h-10 w-1/2' />
          </VStack>
        </>
      ),
    )
    .with({ isSuccess: true }, ({ data }) => (
      <VStack className='justify-around h-full items-end'>
        <HStack className='w-full items-baseline'>
          <AmountComponent
            amount={data?.available}
            size='6xl'
            exchangeRate={exchangeData}
          />
          <Heading>sats</Heading>
        </HStack>
        {data?.available !== 0 && (
          <HStack space={"md"}>
            <Spinner />
            <AmountComponent
              amount={data?.available}
              size='2xl'
              exchangeRate={exchangeData}
            />
          </HStack>
        )}
      </VStack>
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
