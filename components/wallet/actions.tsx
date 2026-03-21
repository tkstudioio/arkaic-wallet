import { ReceiveActionSheet } from "@/components/receive-action-sheet";
import { SendActionSheet } from "@/components/send-action-sheet";
import { HStack } from "@/components/ui/hstack";
import React from "react";
import { View } from "react-native";

export function Actions() {
  return (
    <HStack className='w-full' space={"md"}>
      <View className='flex-1'>
        <SendActionSheet />
      </View>
      <View className='flex-1'>
        <ReceiveActionSheet />
      </View>
    </HStack>
  );
}
