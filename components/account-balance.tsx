import { useBalance } from "@/hooks/use-balance";

import { useWallet } from "@/hooks/use-wallet";
import { ArkaicAccount } from "@/types/arkaic";

import { match } from "ts-pattern";
import { AmountComponent } from "./amount";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Large, P } from "./ui/typography";
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
        <HStack className='aspect-video justify-center'>
          <Spinner />
        </HStack>
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
          <Large>Failed to fetch balance</Large>
          <P>
            {error?.message} {error?.stack}
          </P>
          <P>{error?.stack}</P>
        </VStack>
      </VStack>
    ));
}
