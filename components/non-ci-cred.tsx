import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { CreditCardIcon } from "lucide-react-native";
import { useState } from "react";

export function Noncicredo() {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const handleClose = () => setShowActionsheet(false);

  return (
    <>
      <Actionsheet isOpen={true} onClose={handleClose} snapPoints={[36]}>
        <ActionsheetBackdrop />
        <ActionsheetContent className=''>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className='w-full pt-5'>
            <HStack space='md' className='justify-center items-center'>
              <VStack className='flex-1'>
                <Text className='font-bold'>Mastercard</Text>
                <Text>Card ending in 2345</Text>
              </VStack>
              <VStack className='flex-1'>
                <Text className='font-bold'>Mastercard</Text>
                <Text>Card ending in 2345</Text>
              </VStack>
            </HStack>
            <FormControl className='mt-9'>
              <FormControlLabel>
                <FormControlLabelText>
                  Confirm security code
                </FormControlLabelText>
              </FormControlLabel>
              <Input className='w-full'>
                <InputSlot>
                  <InputIcon as={CreditCardIcon} className='ml-2' />
                </InputSlot>
                <InputField placeholder='CVC/CVV' />
              </Input>
              <Button onPress={handleClose} className='mt-3'>
                <ButtonText className='flex-1'>Pay $1000</ButtonText>
              </Button>
            </FormControl>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
