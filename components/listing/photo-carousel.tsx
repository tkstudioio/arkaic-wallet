import { HStack } from "@/components/ui/hstack";
import { Muted } from "@/components/ui/typography";
import { UPLOADS_BASE_URL } from "@/lib/api";
import { ListingPhoto } from "@/types/backend";
import { Image } from "expo-image";
import { ImageIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import ImageViewing from "react-native-image-viewing";

type PhotoCarouselProps = {
  photos: ListingPhoto[];
  listingId: number;
};

function NoImageFallback() {
  return (
    <View className='w-full aspect-video bg-arkaic-background rounded-lg items-center justify-center'>
      <ImageIcon size={48} className='text-arkaic-muted' />
      <Muted>No image</Muted>
    </View>
  );
}

export function PhotoCarousel({ photos, listingId }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  // Account for layout padding (16px each side) + card padding (16px each side)
  const width = Dimensions.get("window").width - 64;
  const height = width * (9 / 16);

  const images = photos.map((photo) => ({
    uri: `${UPLOADS_BASE_URL}/listings/${listingId}/${photo.filename}`,
  }));

  if (photos.length === 0) return <NoImageFallback />;

  return (
    <View className='w-full rounded-lg overflow-hidden'>
      <Carousel
        ref={ref}
        width={width}
        height={height}
        loop={false}
        onSnapToItem={setCurrentIndex}
        onProgressChange={progress}
        containerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
        data={photos.map((photo, index) => (
          <Pressable
            key={photo.id}
            onPress={() => {
              setGalleryIndex(index);
              setGalleryVisible(true);
            }}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: images[index].uri }}
              style={{ width, height, borderRadius: 8 }}
              contentFit='cover'
              transition={200}
            />
          </Pressable>
        ))}
        renderItem={({ item }) => item}
      />

      {photos.length > 1 && (
        <HStack className='justify-center gap-1.5 py-2'>
          {photos.map((photo, index) => (
            <View
              key={photo.id}
              className={`rounded-full w-2 h-2 ${index === currentIndex ? "bg-arkaic-primary" : "bg-arkaic-border"}`}
            />
          ))}
        </HStack>
      )}

      <ImageViewing
        images={images}
        imageIndex={galleryIndex}
        visible={galleryVisible}
        onRequestClose={() => setGalleryVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
    </View>
  );
}
