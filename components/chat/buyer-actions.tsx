import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Chat, Offer } from "@/types/backend";
import { HandCoins, Handshake } from "lucide-react-native";
import { useState } from "react";
import { NewOfferSheet } from "./new-offer-sheet";

type BuyerActionsProps = {
  chat: Chat;
  activeOffer: Offer | null;
};

export function BuyerActions({ chat, activeOffer }: BuyerActionsProps) {
  const [showOfferSheet, setShowOfferSheet] = useState(false);

  const isPending = activeOffer && activeOffer.acceptance === null;
  const isAccepted = activeOffer?.acceptance?.accepted === true;
  const canMakeOffer = !activeOffer || activeOffer.acceptance?.accepted === false;

  if (isPending) return null;

  return (
    <>
      <HStack space={"md"}>
        {canMakeOffer && (
          <Button
            className='flex-1'
            variant={"outline"}
            onPress={() => setShowOfferSheet(true)}
          >
            <ButtonText>New offer</ButtonText>
            <ButtonIcon as={HandCoins} />
          </Button>
        )}
        {isAccepted && (
          <Button className='flex-1'>
            <ButtonText>Buy</ButtonText>
            <ButtonIcon as={Handshake} />
          </Button>
        )}
      </HStack>

      <NewOfferSheet
        isOpen={showOfferSheet}
        onClose={() => setShowOfferSheet(false)}
        chat={chat}
      />
    </>
  );
}
