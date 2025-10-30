import useProfileStore, { StorageKeys } from "@/stores/profile";
import { ArkaicProfile } from "@/types/arkaic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function useCreateProfile() {
  const { setAccount } = useProfileStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["create-profile"],
    mutationFn: async (profile: ArkaicProfile) => {
      const storedProfiles = await AsyncStorage.getItem("profiles");
      const currentProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];

      try {
        await setAccount(profile);
        await AsyncStorage.setItem(
          StorageKeys.Profiles,
          JSON.stringify([...currentProfiles, profile])
        );

        queryClient.invalidateQueries({ queryKey: ["profiles"] });
        queryClient.invalidateQueries({ queryKey: ["balance"] });
        router.replace("/dashboard");
      } catch (e) {
        throw new Error(
          "Unable to create profile. Maybe the server is unreachable?"
        );
      }
    },
  });
}
