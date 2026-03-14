import { EscrowConfirmSheet } from "@/components/escrow";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Chat, Offer } from "@/types/backend";
import { HandCoins, Handshake } from "lucide-react-native";
import { useState } from "react";

import { AmountComponent } from "../amount";
import { NewOfferSheet } from "./new-offer-sheet";

type BuyerActionsProps = {
  chat: Chat;
  activeOffer: Offer | null;
  hasEscrow?: boolean;
};

export function BuyerActions({
  chat,
  activeOffer,
  hasEscrow,
}: BuyerActionsProps) {
  const isPending = activeOffer && activeOffer.acceptance === null;
  const offerAccepted = activeOffer?.acceptance?.accepted;
  if (isPending || hasEscrow) return null;

  return (
    <>
      <HStack space={"md"}>
        {offerAccepted ? (
          <AmountComponent
            amount={activeOffer.price}
            size='4xl'
            className='w-max'
          />
        ) : (
          <CreateOffer chat={chat} />
        )}
        <BuyActionSheet chat={chat} activeOffer={activeOffer} />
      </HStack>
    </>
  );
}

function CreateOffer(props: { chat: Chat }) {
  const [showOfferSheet, setShowOfferSheet] = useState(false);

  return (
    <>
      <Button
        className='flex-1'
        variant={"outline"}
        onPress={() => setShowOfferSheet(true)}
      >
        <ButtonText>New offer</ButtonText>
        <ButtonIcon as={HandCoins} />
      </Button>
      <NewOfferSheet
        isOpen={showOfferSheet}
        onClose={() => setShowOfferSheet(false)}
        chat={props.chat}
      />
    </>
  );
}

function BuyActionSheet(props: { activeOffer: Offer | null; chat: Chat }) {
  const isAccepted = props.activeOffer?.acceptance?.accepted === true;
  const [showEscrowSheet, setShowEscrowSheet] = useState(false);

  if (!props.chat.listing?.sellerPubkey) return null;

  return (
    <>
      <Button onPress={() => setShowEscrowSheet(true)} className='flex-1'>
        <ButtonText>Buy</ButtonText>
        <ButtonIcon as={Handshake} />
      </Button>

      <EscrowConfirmSheet
        sellerPubkey={props.chat.listing?.sellerPubkey}
        isOpen={showEscrowSheet}
        onClose={() => setShowEscrowSheet(false)}
        chatId={props.chat.id}
        price={
          isAccepted ? props.activeOffer!.price : props.chat.listing!.price
        }
      />
    </>
  );
}
