import { Buffer } from "buffer";
import * as Crypto from "expo-crypto";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import {
  UbuntuMono_400Regular,
  UbuntuMono_700Bold,
} from "@expo-google-fonts/ubuntu-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

if (typeof global.Buffer === "undefined") global.Buffer = Buffer;

if (!global.crypto) global.crypto = {} as any;
if (!global.crypto.getRandomValues) {
  // @ts-expect-error
  global.crypto.getRandomValues = Crypto.getRandomValues;
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { top: paddingTop, bottom: paddingBottom } = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    UbuntuMono_400Regular,
    UbuntuMono_700Bold,
  });

  const client = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={client}>
        <GluestackUIProvider mode='system'>
          <View
            style={{ paddingTop, paddingBottom }}
            className='h-full bg-arkaic-background px-arkaic-md'
          >
            <SafeAreaProvider>
              <Stack
                screenOptions={{
                  animation: "none",
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <StatusBar style='auto' />
            </SafeAreaProvider>
          </View>
        </GluestackUIProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
