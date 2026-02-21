import CreateOrRestoreProfileForm from "@/components/create-profile-form";
import AuthLayout from "@/components/layout/auth-layout";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Image } from "expo-image";
import { Dimensions } from "react-native";

export default function ProfileCreatePage() {
  return (
    <AuthLayout>
      <VStack className='items-center' space={"4xl"}>
        <Image
          source={require("@/assets/images/account-info.svg")}
          style={{
            margin: "auto",
            width: Dimensions.get("window").width * 0.8,
            height: Dimensions.get("window").height * 0.2,
          }}
        />
        <VStack className='items-center'>
          <Heading>Account info</Heading>
          <Text>Give your account a name and select a ASP to connect to</Text>
        </VStack>
        <CreateOrRestoreProfileForm />
      </VStack>
    </AuthLayout>
  );
}
