import { Dimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { get, map, range } from "lodash";
import { Plus, Send } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { AccountBalance } from "./account-balance";
import { CreateProfile } from "./create-profile";
import { SendComponent } from "./send";
import { Badge, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

export function AccountsCarousel() {
  const { setShowTransactionsList, setAccount, account } = useProfileStore();

  const router = useRouter();

  const width = Dimensions.get("window").width;
  const ref = React.useRef<ICarouselInstance>(null);
  const queryClient = useQueryClient();
  const profilesQuery = useProfiles();

  const progress = useSharedValue<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [account]);

  async function onAccountSnap(index: number) {
    setSelectedIndex(index);
    const profile = get(profilesQuery.data, index, undefined);
    console.log(profile);
    if (!profile) return;
    setAccount(profile);
    setShowTransactionsList(true);
  }

  async function changeAccount() {
    const { value } = progress;
    const shouldGetPrevious = selectedIndex > value;
    const nextIndex = shouldGetPrevious ? Math.floor(value) : Math.ceil(value);

    setSelectedIndex(nextIndex);
    setShowTransactionsList(false);

    const profile = get(profilesQuery.data, nextIndex, undefined);
    if (!profile) return;

    setAccount(profile);
  }

  const actions = [
    {
      children: () => <></>,
      onPress: () => router.push("/receive"),
      icon: Plus,
      label: "Receive",
    },
    {
      children: () => <></>,
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
          {item.props?.profile ? (
            <Card variant={"ghost"} className='flex-1'>
              <VStack className='items-center my-auto' space={"lg"}>
                <Badge className='w-max'>
                  <BadgeText>{item.props.profile?.name}</BadgeText>
                </Badge>
                <AccountBalance profile={item.props.profile} />
              </VStack>
            </Card>
          ) : (
            <CreateProfile />
          )}
          <CarouselPagination
            totalSlides={slides.length}
            selectedIndex={selectedIndex}
          />
          <VStack>
            {index !== slides.length - 1 && (
              <HStack className='justify-around'>
                <SendComponent />
                {/* {map(actions, (action, idx) => (
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
                ))} */}
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
