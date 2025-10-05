// import { Card } from "@/components/ui/card";

import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { useTheme } from "@react-navigation/native";
import { Camera, QrCode, Send } from "lucide-react-native";
import React, { useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useSendBitcoin } from "@/hooks/use-send-bitcoin";
import { parserBIP21Address } from "@/utils/parse-bip21-address";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { toNumber, toString } from "lodash";
import { View } from "react-native";
import { match } from "ts-pattern";
import { ArkaicPayment } from "../types/arkaic";

export function SendComponent() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [open, setOpen] = useState<boolean>(false);

  const [amount, setAmount] = useState(0);
  const [arkaicPayment, setArkaicPayment] = useState<ArkaicPayment | undefined>(
    undefined
  );
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const sendBitcoinMutation = useSendBitcoin();

  const [inputAddress, setInputAddress] = useState("");

  function onNewAddressInput(address: string): void {
    const payment = parserBIP21Address(address);

    if (!payment) return;
    setArkaicPayment(payment);
    setShowModal(true);
  }

  function handleSendBitcoins() {
    if (!arkaicPayment?.amount) return;

    sendBitcoinMutation.mutate({
      ...arkaicPayment,
      amount: arkaicPayment.amount!,
    });
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
                className=''
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

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        size='md'
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='lg'>Select amount</Heading>
          </ModalHeader>
          {match(sendBitcoinMutation)
            .with({ isPending: true }, () => <Spinner />)
            .with({ isError: true }, ({ error }) => (
              <Text>{error.message}</Text>
            ))
            .with({ isSuccess: true }, () => (
              <>
                <ModalBody>
                  <Heading>Payment sent!</Heading>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant={"link"}
                    onPress={() => router.replace("/dashboard")}
                  >
                    <ButtonText>Back to dashbooard</ButtonText>
                  </Button>
                </ModalFooter>
              </>
            ))
            .otherwise(() => (
              <>
                <ModalBody>
                  <Input
                    size={"xl"}
                    variant={"underlined"}
                    className='gap-2'
                    isDisabled={!!arkaicPayment?.amount}
                  >
                    <InputField
                      value={toString(
                        !arkaicPayment?.amount ? amount : arkaicPayment.amount
                      )}
                      onChangeText={(v) => setAmount(toNumber(v))}
                      className='text-right'
                      placeholder='--,00'
                    />
                    <Text>SATS</Text>
                  </Input>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant='outline'
                    action='secondary'
                    className='mr-3'
                    onPress={() => {
                      setAmount(0);
                      setShowModal(false);
                    }}
                  >
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                  <Button onPress={handleSendBitcoins}>
                    <ButtonText>Send</ButtonText>
                    <Send size={18} />
                  </Button>
                </ModalFooter>
              </>
            ))}
        </ModalContent>
      </Modal>
    </>
  );
}
