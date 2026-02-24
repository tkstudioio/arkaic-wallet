import { useRouter } from "expo-router";
import { ArchiveRestore, UserPlus } from "lucide-react-native";
import React from "react";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
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
    <VStack className='my-auto' space={"xl"}>
      <Button onPress={onCreate} action={"primary"} className='mx-auto'>
        <ButtonText>Create new account</ButtonText>
        <ButtonIcon as={UserPlus} />
      </Button>
      <Button
        onPress={onRestoreFromSeedPhrase}
        action={"secondary"}
        className='mx-auto '
      >
        <ButtonText>Restore from seed phrase</ButtonText>
        <ButtonIcon as={ArchiveRestore} />
      </Button>
    </VStack>
  );
}
