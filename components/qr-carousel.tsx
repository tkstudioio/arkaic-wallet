import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import React, { useState } from "react";

import { useTheme } from "@react-navigation/native";
import { UseMutateFunction } from "@tanstack/react-query";
import { filter, isUndefined, map } from "lodash";
import { Dimensions } from "react-native";
import QRCode from "react-native-qrcode-skia";
import { useSharedValue } from "react-native-reanimated";

import { CarouselPagination } from "./carousel-pagination";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonText } from "./ui/button";
import { VStack } from "./ui/vstack";

export function QrCarousel(props: {
  copyToClipboard: UseMutateFunction<boolean, Error, string, unknown>;
  paymentOptions: { address?: string; type: string }[];
}) {
  const [index, setIndex] = useState<number>(0);
  const ref = React.useRef<ICarouselInstance>(null);
  const { colors } = useTheme();

  const progress = useSharedValue<number>(0);
  const width = Dimensions.get("window").width;

  const addresses = filter(
    map(props.paymentOptions, (option) => option.address),
    (address) => !isUndefined(address)
  );

  return (
    <Carousel
      ref={ref}
      width={256}
      height={width * (5 / 5)}
      loop={false}
      onSnapToItem={setIndex}
      containerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
      data={map(props.paymentOptions, (option) => (
        <VStack space={"xl"} className='items-center'>
          <>
            <Badge action={option.type === "normal" ? "success" : "info"}>
              <BadgeText>
                {option.type === "normal" ? "arkaic payment" : "lightning swap"}
              </BadgeText>
            </Badge>
            <QRCode
              key={option.address}
              value={option.address || ""}
              size={256}
              color={colors.text}
              shapeOptions={{
                shape: "square",
                eyePatternShape: "square",
                eyePatternGap: 0,
                gap: 0,
              }}
            />
            <CarouselPagination
              totalSlides={addresses.length}
              selectedIndex={index}
            />
            {option.address && (
              <Button
                variant={"link"}
                action={"secondary"}
                onPress={() => props.copyToClipboard(option.address!)}
              >
                <ButtonText>Copy to clipboard</ButtonText>
              </Button>
            )}
          </>
        </VStack>
      ))}
      style={{ padding: 24 }}
      onProgressChange={progress}
      renderItem={({ item, index }) => (
        <VStack className='items-center'>{item}</VStack>
      )}
    />
  );
}
