import * as Crypto from "expo-crypto";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

if (!global.crypto) global.crypto = {} as any;
// @ts-expect-error
global.crypto.getRandomValues = Crypto.getRandomValues;

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider mode='dark'>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name='index'
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name='profile/create'
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name='profile/restore'
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name='receive'
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name='send'
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style='auto' />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
