import { H1 } from "@/components/ui/typography";
// import { useAccountBuyingChats } from "@/hooks/listings/use-account-products";

export default function BuyingList() {
  // const chatsQuery = useAccountBuyingChats();

  return (
    <>
      <H1 className='font-heading'>Buying</H1>
      {/* {match(chatsQuery)
        .with({ isLoading: true }, () => <Spinner className='mt-4' />)
        .with({ isError: true }, () => (
          <P className='text-arkaic-negative'>Failed to load chats.</P>
        ))
        .otherwise(({ data }) => (
          <VStack space='md'>
            {data?.map((chat) => (
              <BuyingChatItem key={chat.id} chat={chat} />
            ))}
            {(!data || data.length === 0) && (
              <P className='text-typography-500'>No active negotiations.</P>
            )}
          </VStack>
        ))} */}
    </>
  );
}
