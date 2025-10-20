import CreateOrRestoreProfileForm from "@/components/create-profile-form";
import AuthLayout from "@/components/layout/auth-layout";

export default function ProfileCreatePage() {
  return (
    <AuthLayout>
      <CreateOrRestoreProfileForm />
    </AuthLayout>
  );
}
