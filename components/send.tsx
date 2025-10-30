import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Camera, QrCode, Send } from "lucide-react-native";
import React, { PropsWithChildren, useState } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { parserBIP21Address } from "@/utils/parse-bip21-address";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View } from "react-native";
import { match } from "ts-pattern";
import { ArkaicPayment } from "../types/arkaic";
import { SendAmountModal } from "./send-amount-modal";
import { Heading } from "./ui/heading";
import { VStack } from "./ui/vstack";

export function SendComponent(props: PropsWithChildren) {
  const [open, setOpen] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [inputAddress, setInputAddress] = useState("");
  const [arkaicPayment, setArkaicPayment] = useState<ArkaicPayment | undefined>(
    undefined
  );
  const [showModal, setShowModal] = useState(false);

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
      <VStack className='items-center w-max'>
        <Button
          action={"secondary"}
          className='flex-col w-max h-max rounded-full size-14'
          onPress={() => setOpen(true)}
        >
          <ButtonIcon as={Send} />
        </Button>
        <Text>Send</Text>
      </VStack>
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-8'>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className='items-center'>
            <Heading>Grant camera access</Heading>
            <Text>Grant camera access to scan a QR.</Text>
          </VStack>

          {match(permission)
            .with({ granted: false }, () => (
              <Button
                variant={"outline"}
                className='w-96 h-96 mx-auto rounded-xl border-dashed'
                size={"xl"}
                onPress={requestPermission}
              >
                <ButtonIcon as={Camera} />
                <ButtonText>Grant camera permissions</ButtonText>
              </Button>
            ))
            .otherwise(() => {
              if (!scanning)
                return (
                  <Button
                    variant='outline'
                    className='w-96 h-96 mx-auto rounded-xl border-dashed'
                    size={"xl"}
                    onPress={() => setScanning(true)}
                  >
                    <ButtonIcon as={QrCode} />
                    <ButtonText>Tap to scan</ButtonText>
                  </Button>
                );

              return (
                <>
                  <View className='w-96 h-96 aspect-square mx-auto'>
                    <CameraView
                      style={{ flex: 1 }}
                      facing='back'
                      // onBarcodeScanned={({ data }) => onNewAddressInput(data)}
                    />
                  </View>
                  <Button
                    action={"negative"}
                    variant={"link"}
                    onPress={() => setScanning(false)}
                  >
                    <ButtonText>Stop scanning</ButtonText>
                  </Button>
                </>
              );
            })}

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

          {/* <VStack className='w-full items-center'>
        {match(onboardUtxos)
          .with({ isSuccess: true }, ({ data: commitmentTxid }) => (
            <VStack className='items-center' space={"xl"}>
              <VStack className='items-center'>
                <Heading>Onboard transaction sent</Heading>
                <Text>Check your transaction on mempool.space</Text>
              </VStack>
              <VStack>
                <Button
                  variant={"link"}
                  action={"secondary"}
                  onPress={() =>
                    Linking.openURL(
                      `https://mempool.space/it/tx/${commitmentTxid}`
                    )
                  }
                >
                  <ButtonText>Check transaction</ButtonText>
                  <ButtonIcon as={ExternalLink} />
                </Button>
                <Button
                  onPress={() => setOpen(false)}
                  variant={"link"}
                  action='negative'
                >
                  <ButtonText>Close</ButtonText>
                  <ButtonIcon />
                </Button>
              </VStack>
            </VStack>
          ))
          .otherwise(() => (
            <>
              <Heading>Onboard funds</Heading>
              <Text>Do you really want to onboard all pending funds?</Text>
            </>
          ))}
      </VStack>

      <VStack className='w-full items-center' space='md'>
        {match(onboardUtxos)
          .with({ isPending: true }, () => (
            <Button disabled variant='link' action='secondary'>
              <ButtonIcon as={Spinner} />
              <ButtonText>Onboarding funds</ButtonText>
            </Button>
          ))
          .with({ isError: true }, ({ mutate }) => (
            <>
              <Text>Error onboarding funds</Text>
              <Button
                disabled
                variant='link'
                action='negative'
                onPress={() => mutate(undefined)}
              >
                <ButtonText>Retry onboard</ButtonText>
              </Button>
            </>
          ))
          .with({ isIdle: true }, ({ mutateAsync }) => {
            async function handleOnboard() {
              await mutateAsync(undefined, {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["onchain-transactions"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["balance"],
                  });
                },
              });
            }
            return (
              <Button onPress={handleOnboard}>
                <ButtonText>Onboard funds</ButtonText>
                <ButtonIcon as={PlaneTakeoff} />
              </Button>
            );
          })
          .otherwise(() => null)}
      </VStack> */}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}

export function SendComponent2() {
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
