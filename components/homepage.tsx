import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { useRouter } from "expo-router";
import { first, isEmpty } from "lodash";
import { useEffect } from "react";
import { CreateProfile } from "./create-profile";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function Home() {
  const router = useRouter();
  const { setAccount } = useProfileStore();
  const { wallet } = useProfileStore();
  const { data: profiles } = useProfiles();

  useEffect(() => {
    if (isEmpty(profiles)) return;
    const defaultProfile = first(profiles);

    if (!defaultProfile) return;
    if (wallet) {
      router.replace("/dashboard");
      return;
    }

    setAccount(defaultProfile);
  }, [wallet, profiles, setAccount, router]);

  return isEmpty(profiles) ? (
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
  ) : (
    <Heading className='text-center' size={"3xl"}>
      Welcome to arkade!
    </Heading>
  );
}
