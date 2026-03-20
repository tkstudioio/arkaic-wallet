import NavigationMenu from "@/components/navigation-menu";
import { ChatListItem } from "@/components/chat-list-item";
import { Spinner } from "@/components/ui/spinner";
import { H1, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useChats } from "@/hooks/chats/use-chats";
import { map } from "lodash";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

export default function ChatsList() {
  const chatsQuery = useChats();

  return (
    <VStack className="h-full">
      <ScrollView className="flex-1">
        <VStack space="lg">
          <H1 className="font-heading">Chats</H1>
          {match(chatsQuery)
            .with({ isLoading: true }, () => <Spinner className="mt-4" />)
            .with({ isError: true }, () => (
              <P className="text-arkaic-negative">Failed to load chats.</P>
            ))
            .otherwise(({ data }) => (
              <VStack space="md">
                {map(data, (chat) => (
                  <ChatListItem key={chat.id} chat={chat} />
                ))}
                {(!data || data.length === 0) && (
                  <P className="text-typography-500">No active chats.</P>
                )}
              </VStack>
            ))}
        </VStack>
      </ScrollView>
      <NavigationMenu />
    </VStack>
  );
}
