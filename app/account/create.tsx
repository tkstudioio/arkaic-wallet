import CreateOrRestoreAccountForm from "@/components/create-account-form";
import AuthLayout from "@/components/layout/auth-layout";
import { VStack } from "@/components/ui/vstack";

export default function AccountCreatePage() {
  return (
    <AuthLayout>
      <VStack className="items-center" space="4xl">
        <CreateOrRestoreAccountForm />
      </VStack>
    </AuthLayout>
  );
}
