import { useAccounts } from "@/hooks/use-accounts";
import { Image } from "expo-image";
import { map } from "lodash";
import { Dimensions, ScrollView } from "react-native";
import { match } from "ts-pattern";
import { AccountListItem } from "./account-list-item";
import { CreateAccount } from "./create-account";
import LogoFull from "./icons/logo";
import AuthLayout from "./layout/auth-layout";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function Home() {
  const accountsQuery = useAccounts();

  return (
    <AuthLayout>
      {match(accountsQuery)
        .with({ data: [] }, () => (
          <VStack space={"4xl"}>
            <Image
              source={require("@/assets/images/no-accounts.svg")}
              style={{
                height: Dimensions.get("window").height * 0.3,
              }}
            />
            <VStack>
              <Heading className='text-center' size={"2xl"}>
                No accounts found
              </Heading>
              <Text className='text-center'>
                create a new account or restore from private key to get started
                with arkaic wallet
              </Text>
            </VStack>
            <CreateAccount />
          </VStack>
        ))
        .otherwise(({ data: accounts }) => (
          <VStack className='items-center justify-center' space={"3xl"}>
            <VStack className='items-center'>
              <LogoFull height={32} width={246} className='flex-1' />
            </VStack>
            <VStack className='items-center'>
              <Heading>Login to one account</Heading>
              <Text>tap on an account and log in</Text>
            </VStack>
            <ScrollView
              style={{ maxHeight: Dimensions.get("window").height * 0.4, width: "100%" }}
            >
              <VStack space={"md"}>
                {map(accounts, (account, index) => (
                  <AccountListItem account={account} key={account.name + index} />
                ))}
              </VStack>
            </ScrollView>
            <CreateAccount />
          </VStack>
        ))}
    </AuthLayout>
  );
}
