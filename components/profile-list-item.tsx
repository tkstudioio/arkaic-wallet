import { useLoginMutation } from "@/hooks/use-login";
import { ArkaicProfile } from "@/types/arkaic";
import { TouchableOpacity } from "react-native";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function ProfileListItem(props: { profile: ArkaicProfile }) {
  const loginMutation = useLoginMutation();
  return (
    <TouchableOpacity onPress={() => loginMutation.mutate(props.profile)}>
      <Card>
        <HStack>
          <VStack>
            <Text>{props.profile.name}</Text>

            <Text size={"xs"}>{props.profile.arkadeServerUrl}</Text>
          </VStack>
          {loginMutation.isPending && <Spinner />}
        </HStack>
      </Card>
    </TouchableOpacity>
  );
}
