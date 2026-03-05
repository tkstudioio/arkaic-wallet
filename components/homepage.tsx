import NoAccountsImage from "@/assets/images/no-accounts.svg";
import { useAccounts } from "@/hooks/use-accounts";
import { map } from "lodash";
import { Dimensions, ScrollView } from "react-native";
import { match } from "ts-pattern";
import { AccountListItem } from "./account-list-item";
import { CreateAccount } from "./create-account";

import { Large } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function Home() {
  const { data: accounts } = useAccounts();

  return match(accounts)
    .with(undefined, () => <VStack></VStack>)
    .with([], () => (
      <VStack space={"4xl"}>
        <NoAccountsImage
          height={Dimensions.get("window").height * 0.3}
          width='100%'
        />
        <VStack>
          <Large className='text-center'>No accounts found</Large>
          <P className='text-center'>
            create a new account or restore from private key to get started with
            arkaic wallet
          </P>
        </VStack>
        <CreateAccount />
      </VStack>
    ))
    .otherwise((accounts) => (
      <VStack className='w-full h-full' space={"3xl"}>
        <ScrollView
          className='flex-1'
          style={{ width: "100%" }}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <VStack space={"md"}>
            {map(accounts, (account, index) => (
              <AccountListItem account={account} key={account.name + index} />
            ))}
          </VStack>
        </ScrollView>
        <CreateAccount />
      </VStack>
    ));
}
