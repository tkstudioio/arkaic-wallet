import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Chat } from "@/types/backend";
import { HandCoins } from "lucide-react-native";
import { useState } from "react";

import { NewOfferSheet } from "./new-offer-sheet";

export function CreateOffer(props: { chat: Chat }) {
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
