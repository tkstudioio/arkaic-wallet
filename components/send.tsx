// import { Card } from "@/components/ui/card";

import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useTheme } from "@react-navigation/native";
import { Camera, QrCode } from "lucide-react-native";
import React, { useState } from "react";

import { parserBIP21Address } from "@/utils/parse-bip21-address";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View } from "react-native";
import { match } from "ts-pattern";
import { ArkaicPayment } from "../types/arkaic";
import { SendAmountModal } from "./send-amount-modal";

export function SendComponent() {
  const { colors } = useTheme();
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
    <>
      <Card size='md' variant='elevated' className='flex flex-col gap-6 mb-48'>
        <Heading size='xl' className='mb-1 mt-3 text-center'>
          Send funds
        </Heading>

        {permission?.granted ? (
          open ? (
            <View className='w-96 h-96 aspect-square  mx-auto'>
              <CameraView
                style={{ flex: 1 }}
                facing='back'
                onBarcodeScanned={({ data }) => onNewAddressInput(data)}
              />
            </View>
          ) : (
            <Button
              variant='outline'
              className='w-96 h-96 mx-auto border-dashed'
              size={"xl"}
              onPress={() => setOpen(true)}
            >
              <QrCode color={colors.text} />
              <ButtonText>Scan</ButtonText>
            </Button>
          )
        ) : (
          <Button variant={"outline"} size={"xl"} onPress={requestPermission}>
            <Camera color={colors.text} />
            <ButtonText>Grant camera permissions</ButtonText>
          </Button>
        )}

        {match(open)
          .with(true, () => (
            <Button
              action='negative'
              variant={"outline"}
              onPress={() => setOpen(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          ))
          .otherwise(() => (
            <>
              <Text className='text-center'>or enter manually</Text>
              <Input size={"xl"} variant={"underlined"}>
                <InputField
                  multiline
                  placeholder='paste bp1... / tark1... / ln...'
                  value={inputAddress}
                  onChangeText={setInputAddress}
                />
              </Input>
              <Button onPress={() => onNewAddressInput(inputAddress)}>
                <ButtonText>Send</ButtonText>
              </Button>
            </>
          ))}
      </Card>

      <SendAmountModal
        open={showModal}
        arkaicPayment={arkaicPayment}
        setOpen={setShowModal}
        amount={amount}
        onAmountChange={setAmount}
      />
    </>
  );
}
