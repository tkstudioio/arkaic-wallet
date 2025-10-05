import { ArkaicProfile } from "@/components/types/arkaic";
import { StorageKeys } from "@/stores/profile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filter } from "lodash";

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-profile"],
    mutationFn: async (profileName: string) => {
      const storedProfiles = await AsyncStorage.getItem(StorageKeys.Profiles);

      const currentProfiles = storedProfiles
        ? (JSON.parse(storedProfiles) as ArkaicProfile[])
        : [];

      const newStoredProfiles = filter(
        currentProfiles,
        (profile) => profile.name !== profileName
      );

      await AsyncStorage.setItem(
        StorageKeys.Profiles,
        JSON.stringify(newStoredProfiles)
      );
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
