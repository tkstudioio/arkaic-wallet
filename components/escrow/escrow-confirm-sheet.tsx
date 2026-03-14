import { AmountComponent } from "@/components/amount";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateEscrow } from "@/hooks/escrows/use-create-escrow";
import { useState } from "react";

type EscrowConfirmSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  chatId: number;
  sellerPubkey: string;
  price: number;
};

const TIMELOCK_OPTIONS = [
  { label: "-3 days", days: -3 },
  { label: "-7 days", days: -7 },
  { label: "-14 days", days: -14 },
];

export function EscrowConfirmSheet({
  isOpen,
  onClose,
  chatId,
  sellerPubkey,
  price,
}: EscrowConfirmSheetProps) {
  const [selectedDays, setSelectedDays] = useState(7);

  const createEscrow = useCreateEscrow();

  const handleConfirm = () => {
    createEscrow.mutate(
      {
        chatId,
        sellerPubkey,
        timelockExpiry: Math.floor(Date.now() / 1000) + selectedDays * 86400,
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
          <VStack space='sm'>
            <Small>Timelock duration</Small>
            <HStack space='sm'>
              {TIMELOCK_OPTIONS.map((opt) => (
                <Button
                  key={opt.days}
                  className='flex-1'
                  variant={selectedDays === opt.days ? "solid" : "outline"}
                  onPress={() => setSelectedDays(opt.days)}
                >
                  <ButtonText>{opt.label}</ButtonText>
                </Button>
              ))}
            </HStack>
          </VStack>

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
