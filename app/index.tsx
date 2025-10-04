import AppLayout from "@/components/layout/app";
import { ProfilesList } from "@/components/profiles/profile-list";

import React from "react";

const Home = () => {
  return (
    <AppLayout>
      <ProfilesList />
    </AppLayout>
  );
};

export default Home;
