import { BuyingChatItem } from "@/components/buying-chat-item";
import { Spinner } from "@/components/ui/spinner";
import { H1, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useBuyerChats } from "@/hooks/chats/use-buyer-chats";
import { map } from "lodash";

import { match } from "ts-pattern";

export default function ChatsList() {
  const chatsQuery = useBuyerChats();

  return (
    <>
      <H1 className='font-heading'>Chats</H1>
      {match(chatsQuery)
        .with({ isLoading: true }, () => <Spinner className='mt-4' />)
        .with({ isError: true }, () => (
          <P className='text-arkaic-negative'>Failed to load chats.</P>
        ))
        .otherwise(({ data }) => (
          <VStack space='md'>
            {map(data, (chat) => (
              <BuyingChatItem key={chat.id} chat={chat} />
            ))}
            {(!data || data.length === 0) && (
              <P className='text-typography-500'>No active chats.</P>
            )}
          </VStack>
        ))}
    </>
  );
}
