import useProfileStore from "@/stores/profile";

import { Card } from "@/components/ui/card";
import { useDeleteProfile } from "@/hooks/use-delete-profile";
import { useProfiles } from "@/hooks/use-profiles";
import { ArkaicProfile } from "@/types/arkaic";
import { useRouter } from "expo-router";
import { first, isEmpty, map } from "lodash";
import { ArchiveRestore, Trash, UserPlus } from "lucide-react-native";
import { useEffect, useState } from "react";

import { TouchableOpacity } from "react-native";
import { match } from "ts-pattern";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./ui/actionsheet";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function ProfilesList() {
  const router = useRouter();
  const profileStore = useProfileStore();
  const profilesQuery = useProfiles();
  const deleteProfileMutation = useDeleteProfile();

  const [showActionsheet, setActionSheetOpen] = useState<boolean>(false);

  async function onAccountSelect(profile: ArkaicProfile) {
    await profileStore.login(profile.name);
    router.replace("/dashboard");
  }

  function onAccountDelete(profileName: string) {
    deleteProfileMutation.mutate(profileName);
  }

  function onCreate() {
    router.push("/profile/create");
  }

  function onRestoreFromSeedPhrase() {
    router.push("/profile/restore");
  }

  function onSheetclose() {
    setActionSheetOpen(false);
  }

  function openSheet() {
    setActionSheetOpen(true);
  }

  useEffect(() => {
    profilesQuery.refetch();
  }, [profilesQuery]);

  if (isEmpty(profilesQuery.data)) {
    return (
      <Card className='w-full items-center gap-16'>
        <VStack className='w-full items-center' space='2xl'>
          <Heading>No profiles yet</Heading>
          <Text className='text-center'>
            You haven&apos;t created any profile yet. Get started by generating
            one or restoring from a 24 words seed phrase
          </Text>
          <VStack space={"lg"} className='w-full'>
            <Button onPress={onCreate}>
              <ButtonText>Create first profile</ButtonText>
              <ButtonIcon as={UserPlus} />
            </Button>
            <Button
              onPress={onRestoreFromSeedPhrase}
              variant={"link"}
              action={"secondary"}
            >
              <ButtonText>Restore from seed phrase</ButtonText>
              <ButtonIcon as={ArchiveRestore} />
            </Button>
          </VStack>
        </VStack>
      </Card>
    );
  }

  return (
    <>
      <Card className='w-full gap-8'>
        <Heading>Profiles</Heading>

        <VStack className='w-full items-center' space='2xl'>
          {match(profilesQuery)
            .with({ isSuccess: true }, ({ data: profiles }) =>
              map(profiles, (profile, idx) => {
                const selectProfile = () => onAccountSelect(profile);
                const deleteProfile = () => {
                  onAccountDelete(profile.name);
                  onSheetclose();
                };
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={selectProfile}
                    className='w-full'
                  >
                    <HStack space={"md"} className='items-center'>
                      <Avatar size={"lg"}>
                        <AvatarFallbackText>
                          {first(profile.name)}
                        </AvatarFallbackText>
                        <AvatarImage source={{ uri: profile.avatar }} />
                      </Avatar>

                      <VStack className='flex-1'>
                        <Heading size={"lg"}>{profile.name}</Heading>
                        <Text>{profile.arkadeServerUrl}</Text>
                      </VStack>

                      <Button
                        variant={"link"}
                        action='negative'
                        onPress={openSheet}
                        className='w-max'
                      >
                        <ButtonIcon as={Trash} />
                      </Button>
                      <Actionsheet
                        isOpen={showActionsheet}
                        onClose={onSheetclose}
                      >
                        <ActionsheetBackdrop />
                        <ActionsheetContent className='gap-8'>
                          <ActionsheetDragIndicatorWrapper>
                            <ActionsheetDragIndicator />
                          </ActionsheetDragIndicatorWrapper>

                          <VStack className='w-full items-center'>
                            <Heading>Delete profile</Heading>
                            <Text>
                              Do you really want to delete this profile?
                            </Text>
                          </VStack>
                          <VStack className='w-full items-center' space='md'>
                            <Button
                              onPress={deleteProfile}
                              action='negative'
                              variant={"link"}
                            >
                              <ButtonText>Delete profile</ButtonText>
                              <ButtonIcon as={Trash} />
                            </Button>
                          </VStack>
                        </ActionsheetContent>
                      </Actionsheet>
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
      <VStack space={"md"}>
        <Button onPress={onCreate}>
          <ButtonText>Create new profile</ButtonText>
        </Button>
        <Button onPress={onRestoreFromSeedPhrase} variant={"link"}>
          <ButtonText>Restore from seed phrase</ButtonText>
        </Button>
      </VStack>
    </>
  );
}
