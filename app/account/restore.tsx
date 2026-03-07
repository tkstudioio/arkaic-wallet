import CreateOrRestoreAccountForm from "@/components/create-account-form";
import AuthLayout from "@/components/layouts/auth-layout";

import React from "react";

export default function AccountRestorePage() {
  return (
    <AuthLayout>
      <CreateOrRestoreAccountForm restore />
    </AuthLayout>
  );
}
