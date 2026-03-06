import { useRouter } from "expo-router";
import React from "react";
import { Button, ButtonText } from "./ui/button";
import { VStack } from "./ui/vstack";

export function CreateAccount() {
  const router = useRouter();

  function onCreate() {
    router.push("/account/create");
  }
  function onRestoreFromSeedPhrase() {
    router.push("/account/restore");
  }

  return (
    <VStack className='w-full' space={"md"}>
      <Button size='lg' onPress={onCreate}>
        <ButtonText>Create account</ButtonText>
      </Button>
      <Button size='lg' onPress={onRestoreFromSeedPhrase} variant={"outline"}>
        <ButtonText>Restore account</ButtonText>
      </Button>
    </VStack>
  );
}
