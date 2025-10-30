import CreateOrRestoreProfileForm from "@/components/create-profile-form";
import AuthLayout from "@/components/layout/auth-layout";

import React from "react";

export default function ProfileRestorePage() {
  return (
    <AuthLayout>
      <CreateOrRestoreProfileForm restore />
    </AuthLayout>
  );
}
