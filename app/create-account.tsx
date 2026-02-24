import CreateOrRestoreAccountForm from "@/components/create-account-form";
import AuthLayout from "@/components/layout/auth-layout";

export default function CreateAccountPage() {
  return (
    <AuthLayout>
      <CreateOrRestoreAccountForm />
    </AuthLayout>
  );
}
