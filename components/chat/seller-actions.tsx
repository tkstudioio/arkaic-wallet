import { AmountComponent } from "@/components/amount";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useRespondToOffer } from "@/hooks/offers/use-respond-to-offer";
import { Offer } from "@/types/backend";

type SellerActionsProps = {
  activeOffer: Offer;
  chatId: number;
};

export function SellerActions({ activeOffer, chatId }: SellerActionsProps) {
  const respondMutation = useRespondToOffer();

  const isPending = activeOffer.acceptance === null;

  if (!isPending) return null;

  return (
    <VStack space={"sm"}>
      <HStack space={"sm"} className='items-center justify-center'>
        <P>Offer:</P>
        <AmountComponent amount={activeOffer.price} />
      </HStack>
      <HStack space={"md"}>
        <Button
          className='flex-1'
          variant={"outline"}
          action={"negative"}
          isDisabled={respondMutation.isPending}
          onPress={() =>
            respondMutation.mutate({
              chatId,
              offerId: activeOffer.id,
              accepted: false,
            })
          }
        >
          {respondMutation.isPending ? (
            <Spinner />
          ) : (
            <ButtonText>Reject</ButtonText>
          )}
        </Button>
        <Button
          className='flex-1'
          action={"positive"}
          isDisabled={respondMutation.isPending}
          onPress={() =>
            respondMutation.mutate({
              chatId,
              offerId: activeOffer.id,
              accepted: true,
            })
          }
        >
          {respondMutation.isPending ? (
            <Spinner />
          ) : (
            <ButtonText>Accept</ButtonText>
          )}
        </Button>
      </HStack>
    </VStack>
  );
}
