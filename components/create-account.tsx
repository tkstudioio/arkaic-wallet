import { Href, useRouter } from "expo-router";
import React from "react";
import { Button, ButtonText } from "./ui/button";
import { VStack } from "./ui/vstack";

export function CreateAccount() {
  const router = useRouter();

  return (
    <VStack className='w-full' space={"md"}>
      <Button size='lg' onPress={() => router.push("/account/create" as Href)}>
        <ButtonText>Create account</ButtonText>
      </Button>
      <Button
        size='lg'
        onPress={() => router.push("/account/restore" as Href)}
        variant={"outline"}
      >
        <ButtonText>Restore account</ButtonText>
      </Button>
    </VStack>
  );
}
