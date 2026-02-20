import CreateProfile from "@/app/create-profile";
import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { useRouter } from "expo-router";
import { first, isEmpty } from "lodash";
import { useEffect } from "react";
import { match } from "ts-pattern";
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

  return match(profilesQuery)
    .with({ data: [] }, () => (
      <VStack space={"4xl"} className='mt-24'>
        <VStack>
          <Heading className='text-center' size={"3xl"}>
            You have no accounts
          </Heading>
          <Text className='text-center' size={"xl"}>
            Create a new one to start using arkaic
          </Text>
        </VStack>
        <CreateProfile />
      </VStack>
    ))
    .otherwise(() => (
      <VStack className='items-center justify-center' space={"3xl"}>
        <Heading className='text-center' size={"3xl"}>
          Welcome to arkade!
        </Heading>
        <Spinner />
      </VStack>
    ));
}
