import { Dimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { useBalance } from "@/hooks/use-balance";
import { useProfiles } from "@/hooks/use-profiles";
import useProfileStore from "@/stores/profile";
import { get, map } from "lodash";
import { ArrowLeftRight } from "lucide-react-native";
import React from "react";
import { match } from "ts-pattern";
import { AccountBalance } from "./account-balance";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function AccountsCarousel() {
  const { login } = useProfileStore();
  const width = Dimensions.get("window").width;
  const ref = React.useRef<ICarouselInstance>(null);
  const balanceQuery = useBalance();
  const profilesQuery = useProfiles();

  if (!profilesQuery.data) return;

  const slides = map(profilesQuery.data, (profile) => (
    <AccountBalance key={profile.privateKey} profile={profile} />
  ));

  async function onChainSnap(index: number) {
    const profile = get(profilesQuery.data, index, undefined);
    if (!profile) return;
    const hasAccountChanged = login(profile.name);
    if (!hasAccountChanged) return;
  }

  return match(balanceQuery)
    .with({ isLoading: true }, () => <Spinner />)
    .with({ isSuccess: true }, () => (
      <Carousel
        ref={ref}
        width={width}
        height={width * (4 / 5)}
        loop={false}
        data={slides}
        style={{ padding: 24 }}
        onSnapToItem={onChainSnap}
        renderItem={({ item }) => item}
      />
    ))
    .otherwise(({ error }) => (
      <VStack className='items-center' space={"md"}>
        <VStack className='items-center'>
          <Heading>Failed to load profile </Heading>
          <Text>{error?.message}</Text>;
        </VStack>
        <Button action='secondary' className='rounded-full' size={"sm"}>
          <ButtonText>Change profile</ButtonText>
          <ButtonIcon as={ArrowLeftRight} />
        </Button>
      </VStack>
    ));
}
