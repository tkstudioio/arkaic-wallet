import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { first, isEmpty } from "lodash";
import { useEffect } from "react";
import { Dimensions } from "react-native";
import { match } from "ts-pattern";
import { CreateProfile } from "./create-profile";
import LogoFull from "./icons/logo";
import AuthLayout from "./layout/auth-layout";
import { Heading } from "./ui/heading";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function Home() {
  const router = useRouter();
  const { setAccount } = useProfileStore();
  const { wallet } = useProfileStore();
  const profilesQuery = useProfiles();

  useEffect(() => {
    if (isEmpty(profilesQuery.data)) return;
    const defaultProfile = first(profilesQuery.data);

    if (!defaultProfile) return;
    if (wallet) {
      router.replace("/dashboard");
      return;
    }

    setAccount(defaultProfile);
  }, [wallet, profilesQuery.data, setAccount, router]);

  return (
    <AuthLayout>
      {match(profilesQuery)
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
            <CreateProfile />
          </VStack>
        ))
        .otherwise(() => (
          <VStack className='items-center justify-center' space={"3xl"}>
            <VStack className='items-center'>
              <LogoFull height={64} width={246} className='flex-1' />
            </VStack>
            <Spinner />
          </VStack>
        ))}
    </AuthLayout>
  );
}
