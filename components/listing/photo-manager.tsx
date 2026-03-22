import { HStack } from "@/components/ui/hstack";
import { Small } from "@/components/ui/typography";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export type LocalPhoto = {
  id: string;
  uri: string;
};

const SLOT_SIZE = 80;

type DraggablePhotoSlotProps = {
  photo: LocalPhoto;
  index: number;
  total: number;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

function DraggablePhotoSlot({ photo, index, total, onRemove, onReorder }: DraggablePhotoSlotProps) {
  const translateX = useSharedValue(0);
  const isActive = useSharedValue(false);
  const zIndex = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .runOnJS(true)
    .onStart(() => {
      isActive.value = true;
      zIndex.value = 100;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const slotsMoved = Math.round(event.translationX / (SLOT_SIZE + 8));
      const newIndex = Math.max(0, Math.min(index + slotsMoved, total - 1));

      if (newIndex !== index) {
        onReorder(index, newIndex);
      }

      translateX.value = withSpring(0);
      isActive.value = false;
      zIndex.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    zIndex: zIndex.value,
    opacity: isActive.value ? 0.8 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[{ width: SLOT_SIZE, height: SLOT_SIZE }, animatedStyle]}
        className="rounded-arkaic-button overflow-hidden relative"
      >
        <Image
          source={{ uri: photo.uri }}
          style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
          contentFit="cover"
        />
        <Pressable
          onPress={() => onRemove(index)}
          className="absolute top-1 right-1 z-10 h-5 w-5 items-center justify-center rounded-full bg-arkaic-negative"
        >
          <X size={12} color="white" />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

type PhotoManagerProps = {
  photos: LocalPhoto[];
  onPhotosChange: (photos: LocalPhoto[]) => void;
  maxPhotos?: number;
};

export function PhotoManager({ photos, onPhotosChange, maxPhotos = 10 }: PhotoManagerProps) {
  async function handleAddPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const remaining = maxPhotos - photos.length;
    const selected = result.assets.slice(0, remaining);

    const newPhotos: LocalPhoto[] = selected.map((asset) => ({
      id: `photo_${Date.now()}_${Math.random()}`,
      uri: asset.uri,
    }));

    onPhotosChange([...photos, ...newPhotos]);
  }

  function handleRemove(index: number) {
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    const updated = [...photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onPhotosChange(updated);
  }

  const canAdd = photos.length < maxPhotos;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <View className="items-start">
          <Pressable
            onPress={handleAddPhoto}
            disabled={!canAdd}
            className="items-center justify-center rounded-arkaic-button border border-dashed border-arkaic-border bg-arkaic-background"
            style={{ width: SLOT_SIZE, height: SLOT_SIZE, opacity: canAdd ? 1 : 0.4 }}
          >
            <Camera size={24} className="text-arkaic-muted" />
            <Small className="text-arkaic-muted">Add</Small>
          </Pressable>
        </View>

        {photos.map((photo, index) => (
          <DraggablePhotoSlot
            key={photo.id}
            photo={photo}
            index={index}
            total={photos.length}
            onRemove={handleRemove}
            onReorder={handleReorder}
          />
        ))}
      </ScrollView>

      <HStack className="justify-end mt-1">
        <Small className="text-arkaic-muted">{photos.length}/{maxPhotos}</Small>
      </HStack>
    </View>
  );
}
