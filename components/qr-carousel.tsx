import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { useColorScheme } from "@/hooks/arkade/use-color-scheme";
import React, { useEffect, useState } from "react";

import { map } from "lodash";
import { Dimensions, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
import { useSharedValue } from "react-native-reanimated";

import { Triangle, Zap } from "lucide-react-native";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

export function QrCarousel(props: {
  paymentOptions: { address?: string; type: string }[];
  onAddressChange?: (address: string | undefined) => void;
}) {
  const [index, setIndex] = useState<number>(0);
  const ref = React.useRef<ICarouselInstance>(null);
  const colorScheme = useColorScheme();

  const fillColor = colorScheme === "dark" ? "#F8FAFC" : "#0F172A";
  const progress = useSharedValue<number>(0);
  const width = Dimensions.get("window").width;
  const qrSize = width - 48;
  const carouselHeight = qrSize + 56; // qr + badge (~28px) + mb-4 (16px) + extra

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
      <Carousel
        ref={ref}
        width={qrSize}
        height={carouselHeight}
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
            }}
          >
            <Badge
              size={"xl"}
              action={option.type === "normal" ? "success" : "warning"}
              className='mb-4'
            >
              <BadgeText>
                {option.type === "normal" ? "Ark payment" : "Lightning swap"}
              </BadgeText>
            </Badge>
            <QRCode
              value={option.address || ""}
              size={qrSize}
              color={fillColor}
              shapeOptions={{
                shape: "square",
                eyePatternShape: "square",
                eyePatternGap: 0,
                gap: 0.5,
              }}
            />
          </View>
        ))}
        onProgressChange={progress}
        renderItem={({ item }) => item}
      />
      <HStack space={"sm"}>
        <ButtonGroup flexDirection='row' className='w-full'>
          {map(props.paymentOptions, (option, i) => (
            <Button
              key={option.type}
              isDisabled={i === index}
              onPress={() => goToSlide(i)}
              className='flex-1'
            >
              <ButtonText>
                {option.type === "normal" ? "Arkaic payment" : "Lightning swap"}
              </ButtonText>
              <ButtonIcon as={option.type === "normal" ? Triangle : Zap} />
            </Button>
          ))}
        </ButtonGroup>
      </HStack>
    </VStack>
  );
}
