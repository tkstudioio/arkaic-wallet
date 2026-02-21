import CreateOrRestoreProfileForm from "@/components/create-profile-form";
import AuthLayout from "@/components/layout/auth-layout";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function ProfileCreatePage() {
  return (
    <AuthLayout>
      <VStack className='items-center' space={"4xl"}>
        <VStack className='items-center'>
          <Heading>Account info</Heading>
          <Text className='text-center'>
            Give your account a name and select a ASP to connect to
          </Text>
        </VStack>
        <CreateOrRestoreProfileForm />
      </VStack>
    </AuthLayout>
  );
}
