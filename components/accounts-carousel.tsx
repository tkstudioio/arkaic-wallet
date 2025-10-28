import { Dimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { useBalance } from "@/hooks/use-balance";
import useSettingsStore, { ChainSetting } from "@/stores/settings";
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
  const { setChain } = useSettingsStore();
  const width = Dimensions.get("window").width;
  const ref = React.useRef<ICarouselInstance>(null);
  const balanceQuery = useBalance();

  const slides = [<AccountBalance key={"accountid"} />];

  function onChainSnap(index: number) {
    if (index === 0) {
      setChain(ChainSetting.Ark);
    }
    if (index === 1) {
      setChain(ChainSetting.Onchain);
    }
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
