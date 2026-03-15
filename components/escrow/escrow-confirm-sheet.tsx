import { AmountComponent } from "@/components/amount";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Large, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateEscrow } from "@/hooks/escrows/use-create-escrow";

type EscrowConfirmSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  chatId: number;
  sellerPubkey: string;
  price: number;
};

export function EscrowConfirmSheet({
  isOpen,
  onClose,
  chatId,
  sellerPubkey,
  price,
}: EscrowConfirmSheetProps) {
  const createEscrow = useCreateEscrow();

  const handleConfirm = () => {
    createEscrow.mutate(
      {
        chatId,
        sellerPubkey,
        timelockExpiry: Math.floor(Date.now() / 1000) + -7 * 86400,
        price: price,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className='gap-8'>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <VStack space='sm' className='items-center'>
          <Large>Agreed price</Large>
          <P>Confirm purchase details</P>
        </VStack>

        <AmountComponent size='5xl' amount={price} />

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
  );
}
