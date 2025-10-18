import AuthLayout from "@/components/layout/auth-layout";
import { ProfilesList } from "@/components/profiles-list";

import React from "react";

const Home = () => {
  return (
    <AuthLayout>
      <ProfilesList />
    </AuthLayout>
  );
};

export default Home;
