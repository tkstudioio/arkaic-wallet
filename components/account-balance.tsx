import { useBalance } from "@/hooks/use-balance";

import { useWallet } from "@/hooks/use-wallet";
import { ArkaicAccount } from "@/types/arkaic";

import { match } from "ts-pattern";
import { AmountComponent } from "./amount";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Skeleton } from "./ui/skeleton";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function AccountBalance(props: { account: ArkaicAccount }) {
  const { data: wallet } = useWallet(props.account);
  const balanceQuery = useBalance(wallet);

  return match(balanceQuery)
    .with(
      { isFetching: true },
      { isLoading: true },
      { isPending: true },
      () => (
        <>
          <VStack className='justify-around h-0.5 items-end'>
            <Skeleton className='h-20' />
            <Skeleton className='h-10 w-1/2' />
          </VStack>
        </>
      ),
    )
    .with({ isSuccess: true }, ({ data }) => (
      <HStack className='aspect-video justify-center'>
        <AmountComponent amount={data?.available} size='6xl' />
      </HStack>
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
