import AppLayout from "@/components/layout/app";
import { ProfilesList } from "@/components/profiles/profile-list";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";

import React from "react";

const Home = () => {
  const router = useRouter();
  return (
    <AppLayout>
      <VStack space='4xl' className='items-center justify-center h-full'>
        <Heading size='2xl'>Select profile</Heading>
        <ProfilesList />
        <Button
          onPress={() => router.replace("/create-profile")}
          variant={"link"}
        >
          <ButtonText>Create new profile</ButtonText>
        </Button>
      </VStack>
    </AppLayout>
  );
};

export default Home;
