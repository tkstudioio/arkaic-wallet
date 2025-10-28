import { Dimensions } from "react-native";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

import { useBalance } from "@/hooks/use-balance";
import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { useRouter } from "expo-router";
import { first, get, isEmpty, map } from "lodash";
import { ArchiveRestore, Plus, Send, UserPlus } from "lucide-react-native";
import React, { useEffect } from "react";
import { useSharedValue } from "react-native-reanimated";
import { match } from "ts-pattern";
import { AccountBalance } from "./account-balance";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function AccountsCarousel() {
  const { login } = useProfileStore();
  const router = useRouter();

  const width = Dimensions.get("window").width;
  const ref = React.useRef<ICarouselInstance>(null);
  const balanceQuery = useBalance();
  const profilesQuery = useProfiles();
  const progress = useSharedValue<number>(0);

  function onCreate() {
    router.push("/profile/create");
  }
  function onRestoreFromSeedPhrase() {
    router.push("/profile/restore");
  }

  useEffect(() => {
    if (isEmpty(profilesQuery.data)) return;
    const defaultProfile = first(profilesQuery.data);
    if (!defaultProfile) return;
    login(defaultProfile.name);
  }, [profilesQuery.data]);

  const slides = [
    ...map(profilesQuery.data, (profile) => (
      <AccountBalance key={profile.privateKey} profile={profile} />
    )),
    <Card key='create' variant={"ghost"} className='flex-1'>
      <VStack className='w-full my-auto'>
        <Button variant={"link"} onPress={onCreate} size={"xl"}>
          <ButtonText>Create new account</ButtonText>
          <ButtonIcon as={UserPlus} />
        </Button>
        <Button
          onPress={onRestoreFromSeedPhrase}
          action={"secondary"}
          variant={"link"}
          size={"sm"}
        >
          <ButtonText>Restore from seed phrase</ButtonText>
          <ButtonIcon as={ArchiveRestore} />
        </Button>
      </VStack>
    </Card>,
  ];

  async function onChainSnap(index: number) {
    const profile = get(profilesQuery.data, index, undefined);
    if (!profile) return;
    const hasAccountChanged = login(profile.name);
    if (!hasAccountChanged) return;
  }

  const actions = [
    {
      onPress: () => router.push("/receive"),
      icon: Plus,
      label: "Receive",
    },
    {
      onPress: () => router.push("/send"),
      icon: Send,
      label: "Send",
    },
  ];

  return (
    <Carousel
      ref={ref}
      width={width}
      height={width * (4 / 5)}
      loop={false}
      data={slides}
      style={{ padding: 24 }}
      onSnapToItem={onChainSnap}
      onProgressChange={progress}
      renderItem={({ item, index }) =>
        match(balanceQuery)
          .with({ isLoading: true }, () => <Spinner />)
          .with({ isSuccess: true }, () => (
            <VStack className='h-full'>
              {item}

              <VStack>
                <Pagination.Basic
                  progress={progress}
                  data={slides}
                  dotStyle={{
                    backgroundColor: "red",
                    borderRadius: 50,
                  }}
                  containerStyle={{ gap: 5, marginTop: 10 }}
                />

                {index !== slides.length - 1 && (
                  <HStack className='justify-around'>
                    {map(actions, (action, idx) => (
                      <VStack key={idx} className='items-center w-max'>
                        <Button
                          action={"secondary"}
                          className='flex-col w-max h-max rounded-full size-14'
                          onPress={action.onPress}
                        >
                          <ButtonIcon as={action.icon} />
                        </Button>
                        <Text>{action.label}</Text>
                      </VStack>
                    ))}
                  </HStack>
                )}
              </VStack>
            </VStack>
          ))
          .otherwise(({ error }) => (
            <VStack className='items-center' space={"md"}>
              <VStack className='items-center'>
                <Heading>Failed to load profile</Heading>
                <Text>{error?.message}</Text>;
              </VStack>
            </VStack>
          ))
      }
    />
  );
}
