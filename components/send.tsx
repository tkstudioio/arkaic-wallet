import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Camera, QrCode } from "lucide-react-native";
import React, { useState } from "react";

import { parserBIP21Address } from "@/utils/parse-bip21-address";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View } from "react-native";
import { match } from "ts-pattern";
import { ArkaicPayment } from "../types/arkaic";
import { SendAmountModal } from "./send-amount-modal";
import { VStack } from "./ui/vstack";

export function SendComponent() {
  const [permission, requestPermission] = useCameraPermissions();
  const [open, setOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState(0);
  const [arkaicPayment, setArkaicPayment] = useState<ArkaicPayment | undefined>(
    undefined
  );
  const [showModal, setShowModal] = useState(false);

  const [inputAddress, setInputAddress] = useState("");

  function onNewAddressInput(address: string): void {
    const payment = parserBIP21Address(address);
    if (!payment) return;

    setArkaicPayment(payment);
    setShowModal(true);

    if (payment.amount) {
      setAmount(payment.amount);
    }
  }

  return (
    <VStack space={"4xl"}>
      {permission?.granted ? (
        open ? (
          <View className='w-96 h-96 aspect-square mx-auto'>
            <CameraView
              style={{ flex: 1 }}
              facing='back'
              onBarcodeScanned={({ data }) => onNewAddressInput(data)}
            />
          </View>
        ) : (
          <Button
            variant='outline'
            className='w-96 h-96 mx-auto rounded-xl border-dashed'
            size={"xl"}
            onPress={() => setOpen(true)}
          >
            <ButtonIcon as={QrCode} />
            <ButtonText>Tap to scan</ButtonText>
          </Button>
        )
      ) : (
        <Button
          variant={"outline"}
          className='w-96 h-96 mx-auto rounded-xl border-dashed'
          size={"xl"}
          onPress={requestPermission}
        >
          <ButtonIcon as={Camera} />
          <ButtonText>Grant camera permissions</ButtonText>
        </Button>
      )}

      {match(open)
        .with(true, () => (
          <Button
            action='negative'
            variant={"link"}
            onPress={() => setOpen(false)}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
        ))
        .otherwise(() => (
          <VStack space={"xl"}>
            <Text className='text-center'>or enter manually</Text>
            <Input size={"xl"} variant={"underlined"}>
              <InputField
                multiline
                placeholder='paste bp1... / tark1... / ln...'
                value={inputAddress}
                onChangeText={setInputAddress}
              />
            </Input>
            <Button
              variant={"outline"}
              onPress={() => onNewAddressInput(inputAddress)}
            >
              <ButtonText>Confirm address</ButtonText>
            </Button>
          </VStack>
        ))}

      <SendAmountModal
        open={showModal}
        arkaicPayment={arkaicPayment}
        setOpen={setShowModal}
        amount={amount}
        onAmountChange={setAmount}
      />
    </VStack>
  );
}
