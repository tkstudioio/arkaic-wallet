import { AmountComponent } from "@/components/amount";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Large, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateEscrow } from "@/hooks/escrows/use-create-escrow";
import { Chat } from "@/types/backend";
import { Handshake } from "lucide-react-native";
import { useState } from "react";

export function BuyListing(props: { chat: Chat; price: number }) {
  const [open, setOpen] = useState(false);
  const createEscrow = useCreateEscrow();

  const handleConfirm = () => {
    createEscrow.mutate(
      {
        chatId: props.chat.id,
        sellerPubkey: props.chat.listing.sellerPubkey,
        timelockExpiry: Math.floor(Date.now() / 1000) + -7 * 86400,
        price: props.price,
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <>
      <Button onPress={() => setOpen(true)} className='flex-1'>
        <ButtonText>Buy</ButtonText>
        <ButtonIcon as={Handshake} />
      </Button>

      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-8'>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack space='sm' className='items-center'>
            <Large>Agreed price</Large>
            <P>Confirm purchase details</P>
          </VStack>

          <AmountComponent size='5xl' amount={props.price} />

          <VStack space='xl' className='w-full'>
            <Button onPress={handleConfirm} isDisabled={createEscrow.isPending}>
              {createEscrow.isPending ? (
                <Spinner />
              ) : (
                <ButtonText>Confirm</ButtonText>
              )}
            </Button>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
