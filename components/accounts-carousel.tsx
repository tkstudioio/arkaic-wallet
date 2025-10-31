import { Dimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { useQueryClient } from "@tanstack/react-query";
import { get, map } from "lodash";
import React, { useEffect, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { AccountBalance } from "./account-balance";
import { CreateProfile } from "./create-profile";

import { CarouselPagination } from "./carousel-pagination";
import { ReceiveActionSheet } from "./receive-action-sheet";
import { SendActionSheet } from "./send-action-sheet";
import { Badge, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

export function AccountsCarousel() {
  const { setShowTransactionsList, setAccount, account } = useProfileStore();

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
                <SendActionSheet />
                <ReceiveActionSheet />
              </HStack>
            )}
          </VStack>
        </VStack>
      )}
    />
  );
}
