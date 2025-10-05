import { Heading } from "@/components/ui/heading";
import useProfileStore from "@/stores/profile";

import { useDeleteProfile } from "@/hooks/use-delete-profile";
import { useProfiles } from "@/hooks/use-profiles";
import { useRouter } from "expo-router";
import { map } from "lodash";
import { Trash } from "lucide-react-native";
import { useEffect } from "react";
import { Image, TouchableOpacity } from "react-native";
import { match } from "ts-pattern";
import { ArkaicProfile } from "../types/arkaic";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { Button, ButtonIcon } from "../ui/button";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

export function ProfilesList() {
  const router = useRouter();
  const profileStore = useProfileStore();

  const profilesQuery = useProfiles();
  const deleteProfileMutation = useDeleteProfile();

  useEffect(() => {
    profilesQuery.refetch();
  }, [profilesQuery]);

  async function onAccountSelect(profile: ArkaicProfile) {
    await profileStore.login(profile.name);
    router.replace("/dashboard");
  }

  function onAccountDelete(profileName: string) {
    deleteProfileMutation.mutate(profileName);
  }

  return (
    <Card className='gap-6 w-full'>
      <VStack space={"4xl"}>
        {match(profilesQuery)
          .with({ isSuccess: true }, ({ data: profiles }) =>
            map(profiles, (profile, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    onAccountSelect(profile);
                  }}
                >
                  <HStack space={"sm"} className='items-center'>
                    <Avatar>
                      <AvatarImage source={{ uri: profile.avatar }} />
                      <AvatarFallbackText>ND</AvatarFallbackText>
                    </Avatar>

                    <Image src={profile.avatar} />
                    <VStack className='flex-1'>
                      <Heading>{profile.name}</Heading>
                      <Text>{profile.arkadeServerUrl}</Text>
                    </VStack>
                    <Button
                      variant={"link"}
                      action='negative'
                      onPress={() => onAccountDelete(profile.name)}
                    >
                      <ButtonIcon as={Trash} />
                    </Button>
                  </HStack>
                </TouchableOpacity>
              );
            })
          )
          .otherwise(() => (
            <Text>Error</Text>
          ))}
      </VStack>
    </Card>
  );
}
