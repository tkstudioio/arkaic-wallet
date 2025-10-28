import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { useRouter } from "expo-router";
import { first, isEmpty } from "lodash";
import { CreateProfile } from "./create-profile";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function Home() {
  const router = useRouter();
  const { login } = useProfileStore();
  const { wallet } = useProfileStore();
  const { data: profiles } = useProfiles();

  if (wallet) {
    router.replace("/dashboard");
  }

  if (isEmpty(profiles)) {
    return (
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
    );
  }

  if (!wallet) {
    login(first(profiles)!.name);
    return;
  }
}
