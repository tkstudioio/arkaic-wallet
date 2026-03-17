import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { useRespondToOffer } from "@/hooks/offers/use-respond-to-offer";
import { Offer } from "@/types/backend";
import { Check, X } from "lucide-react-native";

type SellerActionsProps = {
  activeOffer: Offer;
  chatId: number;
};

export function SellerOfferActions({
  activeOffer,
  chatId,
}: SellerActionsProps) {
  const respondMutation = useRespondToOffer();
  const isPending = activeOffer.acceptance === null;
  if (!isPending) return null;

  return (
    <VStack space={"sm"}>
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
          <ButtonIcon as={X} />
          <ButtonText>Reject</ButtonText>

          {respondMutation.isPending && <Spinner />}
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
          <ButtonIcon as={Check} />
          <ButtonText>Accept</ButtonText>

          {respondMutation.isPending && <Spinner />}
        </Button>
      </HStack>
    </VStack>
  );
}
