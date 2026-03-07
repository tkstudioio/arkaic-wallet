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
import { useEffect } from "react";

if (!global.crypto) global.crypto = {} as any;
if (!global.crypto.getRandomValues) {
  // @ts-expect-error
  global.crypto.getRandomValues = Crypto.getRandomValues;
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    UbuntuMono_400Regular,
    UbuntuMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode='system'>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style='auto' />
    </GluestackUIProvider>
  );
}
