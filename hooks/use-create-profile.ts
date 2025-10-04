import { ArkaicProfile } from "@/components/types/arkaic";
import useProfileStore, { StorageKeys } from "@/stores/wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function useCreateProfile() {
  const { login } = useProfileStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["create-profile"],
    mutationFn: async (profile: ArkaicProfile) => {
      const storedProfiles = await AsyncStorage.getItem("profiles");
      const currentProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];

      await AsyncStorage.setItem(
        StorageKeys.Profiles,
        JSON.stringify([...currentProfiles, profile])
      );

      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });

      await login(profile.name);
      router.replace("/dashboard");
    },
  });
}
