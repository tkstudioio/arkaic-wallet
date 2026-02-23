import CreateOrRestoreProfileForm from "@/components/create-profile-form";
import AuthLayout from "@/components/layout/auth-layout";
import { VStack } from "@/components/ui/vstack";

export default function ProfileCreatePage() {
  return (
    <AuthLayout>
      <VStack className="items-center" space="4xl">
        <CreateOrRestoreProfileForm />
      </VStack>
    </AuthLayout>
  );
}
