import { Home } from "@/components/homepage";
import AuthLayout from "@/components/layouts/auth-layout";

import React from "react";

const HomePage = () => {
  return (
    <AuthLayout>
      <Home />
    </AuthLayout>
  );
};

export default HomePage;
