import { Dimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { useBalance } from "@/hooks/use-balance";
import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { useRouter } from "expo-router";
import { first, get, map, range } from "lodash";
import { Plus, Send } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { match } from "ts-pattern";
import { AccountBalance } from "./account-balance";
import { CreateProfile } from "./create-profile";
import { Badge } from "./ui/badge";
import { Button, ButtonIcon } from "./ui/button";
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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const defaultProfile = useMemo(
    () => first(profilesQuery.data),
    [profilesQuery.data]
  );

  useEffect(() => {
    if (!defaultProfile) return;
    login(defaultProfile.name);
  }, [defaultProfile]);

  const slides = [
    ...map(profilesQuery.data, (profile) => (
      <AccountBalance key={profile.privateKey} profile={profile} />
    )),
    <VStack key={"create"} className='h-full my-auto border'>
      <CreateProfile />
      <CarouselPagination
        totalSlides={profilesQuery.data ? profilesQuery.data.length + 1 : 1}
        selectedIndex={selectedIndex}
      />
    </VStack>,
  ];

  async function onAccountSnap(index: number) {
    setSelectedIndex(index);
    const profile = get(profilesQuery.data, index, undefined);
    if (!profile) return;
    const hasAccountChanged = login(profile.name);
    if (!hasAccountChanged) return;
  }

  async function changeAccount() {
    const { value } = progress;

    const shouldGetPrevious = selectedIndex > value;

    setSelectedIndex(shouldGetPrevious ? Math.floor(value) : Math.ceil(value));

    const profile = get(profilesQuery.data, selectedIndex, undefined);
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
      onScrollStart={changeAccount}
      loop={false}
      data={slides}
      style={{ padding: 24 }}
      onSnapToItem={onAccountSnap}
      onProgressChange={progress}
      renderItem={({ item, index }) => (
        <VStack className='h-full gap-8'>
          {match(balanceQuery)
            .with({ isLoading: true }, () => <Spinner />)
            .with({ isSuccess: true }, () => <>{item}</>)
            .otherwise(({ error }) => (
              <VStack className='items-center' space={"md"}>
                <VStack className='items-center'>
                  <Heading>Failed to load profile</Heading>
                  <Text>
                    {error?.message} {error?.stack}
                  </Text>
                  <Text>{error?.stack}</Text>
                </VStack>
              </VStack>
            ))}
          <CarouselPagination
            totalSlides={slides.length}
            selectedIndex={selectedIndex}
          />
          <VStack>
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
      )}
    />
  );
}

function CarouselPagination(props: {
  totalSlides: number;
  selectedIndex: number;
}) {
  return (
    <HStack className='justify-center' space={"xs"}>
      {map(range(props.totalSlides), (index) => (
        <Badge
          key={index}
          className='rounded-full size-2! w-1 h-1 p-0! aspect-square'
          variant={"outline"}
          action={index === props.selectedIndex ? "info" : "muted"}
        />
      ))}
    </HStack>
  );
}
