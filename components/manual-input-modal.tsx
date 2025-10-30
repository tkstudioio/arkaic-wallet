import { Button, ButtonText } from "@/components/ui/button";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import React, { useEffect, useState } from "react";

import { Input, InputField } from "./ui/input";
import { VStack } from "./ui/vstack";

type ManualAddressProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAddressInput: (address: string) => void;
};
export function ManualInputModal(props: ManualAddressProps) {
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (props.open) return;
    setAddress("");
  }, [props.open]);

  return (
    <Modal
      isOpen={props.open}
      onClose={() => {
        props.setOpen(false);
      }}
      size='md'
    >
      <ModalBackdrop />
      <ModalContent>
        <VStack space={"xl"}>
          <Text className='text-center'>Paste payment address</Text>
          <Input size={"xl"} variant={"underlined"}>
            <InputField
              multiline
              placeholder='paste bp1... / tark1... / ln...'
              value={address}
              onChangeText={setAddress}
            />
          </Input>
          <Button
            variant={"outline"}
            onPress={() => props.onAddressInput(address)}
          >
            <ButtonText>Continue</ButtonText>
          </Button>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
