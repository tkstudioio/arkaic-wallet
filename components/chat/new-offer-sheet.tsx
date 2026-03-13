import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Large, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useSendMessage } from "@/hooks/messages/use-send-message";
import { Chat } from "@/types/backend";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type NewOfferSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
};

export function NewOfferSheet({ isOpen, onClose, chat }: NewOfferSheetProps) {
  const [price, setPrice] = useState("");
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();

  const handleSubmit = () => {
    const offerPrice = Number(price);
    if (!offerPrice || offerPrice <= 0) return;

    sendMessage.mutate(
      { chatId: chat.id, offeredPrice: offerPrice },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["active-offer", chat.id],
          });
          setPrice("");
          onClose();
        },
      },
    );
  };

  return (
    <Actionsheet
      isOpen={isOpen}
      onClose={() => {
        setPrice("");
        onClose();
      }}
    >
      <ActionsheetBackdrop />
      <ActionsheetContent className='gap-8'>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <VStack className='items-center'>
          <Large>New offer</Large>
          <P>Enter your offer price in sats</P>
        </VStack>

        <VStack space={"xl"} className='w-full'>
          <Input>
            <InputField
              placeholder='Price in sats'
              value={price}
              onChangeText={setPrice}
              keyboardType='numeric'
            />
          </Input>

          <Button
            onPress={handleSubmit}
            isDisabled={!price || Number(price) <= 0 || sendMessage.isPending}
          >
            {sendMessage.isPending ? <Spinner /> : <ButtonText>Send offer</ButtonText>}
          </Button>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
}
