import { useBalance } from "@/hooks/use-balance";

import { useWallet } from "@/hooks/use-wallet";
import { ArkaicAccount } from "@/types/arkaic";

import useAccountStore from "@/stores/account";
import { AmountComponent } from "./amount";
import { Badge, BadgeText } from "./ui/badge";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Large, P } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function AccountBalance(props: { account: ArkaicAccount }) {
  const { data: wallet } = useWallet(props.account);
  const { account } = useAccountStore();
  const balanceQuery = useBalance(wallet);

  if (!balanceQuery.isFetched) return <Spinner />;

  if (!balanceQuery.isSuccess)
    return (
      <VStack className='items-center' space={"md"}>
        <VStack className='items-center'>
          <Large>Failed to fetch balance</Large>
          <P>
            {balanceQuery.error?.message} {balanceQuery.error?.stack}
          </P>
          <P>{balanceQuery.error?.stack}</P>
        </VStack>
      </VStack>
    );

  return (
    <VStack className='items-center pb-12 pt-6' space={"sm"}>
      <Badge size={"xl"}>
        <BadgeText>{account?.name}</BadgeText>
      </Badge>
      <HStack>
        {balanceQuery.isRefetching && (
          <Spinner className='absolute -right-4 ' />
        )}
        <AmountComponent amount={balanceQuery.data?.available} size='6xl' />
      </HStack>
    </VStack>
  );
}
