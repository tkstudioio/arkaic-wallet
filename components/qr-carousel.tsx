import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import React, { useEffect, useState } from "react";

import { map } from "lodash";
import { Dimensions, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
import { useSharedValue } from "react-native-reanimated";

import { colors } from "@/theme/tokens";
import { Button, ButtonGroup, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

export function QrCarousel(props: {
  paymentOptions: { address?: string; type: string }[];
  onAddressChange?: (address: string | undefined) => void;
}) {
  const [index, setIndex] = useState<number>(0);
  const ref = React.useRef<ICarouselInstance>(null);

  const progress = useSharedValue<number>(0);
  const width = Dimensions.get("window").width;
  const qrSize = width - 48;

  const currentAddress = props.paymentOptions[index]?.address;

  useEffect(() => {
    props.onAddressChange?.(currentAddress);
  }, [currentAddress]);

  const goToSlide = (i: number) => {
    ref.current?.scrollTo({ index: i, animated: true });
    setIndex(i);
  };

  return (
    <VStack space={"xl"} className='items-center'>
      <HStack space={"sm"}>
        <ButtonGroup flexDirection='row'>
          {map(props.paymentOptions, (option, i) => (
            <Button
              key={option.type}
              action={i === index ? "primary" : "secondary"}
              isDisabled={i === index}
              onPress={() => goToSlide(i)}
              className='w-min'
            >
              <ButtonText>
                {option.type === "normal" ? "Arkaic payment" : "Lightning swap"}
              </ButtonText>
            </Button>
          ))}
        </ButtonGroup>
      </HStack>

      <Carousel
        ref={ref}
        width={qrSize}
        height={qrSize}
        loop={false}
        enabled={false}
        onSnapToItem={setIndex}
        containerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
        data={map(props.paymentOptions, (option) => (
          <View
            key={option.address}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <QRCode
              value={option.address || ""}
              size={qrSize - 32}
              color={colors.foreground}
              shapeOptions={{
                shape: "square",
                eyePatternShape: "square",
                eyePatternGap: 0,
                gap: 0,
              }}
            />
          </View>
        ))}
        onProgressChange={progress}
        renderItem={({ item }) => item}
      />

    </VStack>
  );
}
