import { ArkaicProfile } from "@/components/types/arkaic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const storedProfiles = await AsyncStorage.getItem("profiles");
      const currentProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];
      return currentProfiles as ArkaicProfile[];
    },
    refetchOnMount: true,
  });
}
