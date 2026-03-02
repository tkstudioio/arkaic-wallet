import CreateOrRestoreAccountForm from "@/components/create-account-form";
import AuthLayout from "@/components/layout/auth-layout";

export default function AccountCreatePage() {
  return (
    <AuthLayout>
      <CreateOrRestoreAccountForm />
    </AuthLayout>
  );
}
