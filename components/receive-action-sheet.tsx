import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { LayoutDashboard, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { useRouter } from "expo-router";
import PosComponent from "./pos";

import { usePaymentAddress } from "@/hooks/use-payment-address";
import useAccountStore from "@/stores/account";
import { IncomingFunds } from "@arkade-os/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { map, toString } from "lodash";
import { match } from "ts-pattern";
import { Input, InputField } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Large, Muted, P } from "./ui/typography";
import { VStack } from "./ui/vstack";

import { useCopyToClipboard } from "@/hooks/use-clipboard";
import { Toast } from "toastify-react-native";
import { QrCarousel } from "./qr-carousel";
import { HStack } from "./ui/hstack";

export function ReceiveActionSheet() {
  const { arkadeLightning } = useAccountStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const walletAddressMutation = usePaymentAddress();
  const { mutate: copyToClipboard } = useCopyToClipboard();
  const { wallet } = useAccountStore();

  const [open, setOpen] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);

  const [transaction, setTransaction] = useState<IncomingFunds | undefined>(
    undefined,
  );
  const [amountInSats, setAmountInSats] = useState<number>(0);
  const [currentAddress, setCurrentAddress] = useState<string | undefined>();

  function backToDashboard() {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    router.replace("/dashboard");
    setOpen(false);
  }

  useEffect(() => {
    if (!wallet) return;
    const stopListening = wallet.notifyIncomingFunds(setTransaction);

    return () => {
      stopListening.then((fn) => fn?.());
    };
  }, [wallet]);

  useEffect(() => {
    if (!showQrCode) return;
    walletAddressMutation.mutate(amountInSats, {
      onSuccess: async (data) => {
        if (!data.lnInvoice || !arkadeLightning) return;
        try {
          const receivalResult = await arkadeLightning.waitAndClaim(
            data.lnInvoice?.pendingSwap,
          );
          if (!receivalResult) throw new Error("no receival result");
          Toast.success("LN Swap received");
        } catch (e) {
          console.log(e);
          Toast.error("Error listening for ln swap");
        }
      },
    });
  }, [amountInSats, showQrCode]);

  useEffect(() => {
    if (open) return;
    walletAddressMutation.reset();
    setShowQrCode(false);
    setAmountInSats(0);
    setTransaction(undefined);
  }, [open]);

  return (
    <>
      <Button
        action={"primary"}
        onPress={() => setOpen(true)}
        className='flex-shrink-0'
      >
        <ButtonIcon as={Plus} />
        <ButtonText>Receive</ButtonText>
      </Button>

      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-8'>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {!showQrCode ? (
            <VStack className='items-center'>
              <Large>Select amount</Large>
              <Muted>Type an amount or leave empty</Muted>
            </VStack>
          ) : transaction ? (
            <VStack className='items-center'>
              <Large>Payment fulfilled</Large>
              <P>You have an incoming transaction</P>
            </VStack>
          ) : (
            <VStack className='items-center'>
              <Large>Payment</Large>
              <Muted>Show payment request</Muted>
            </VStack>
          )}

          {!showQrCode ? (
            <VStack space={"4xl"}>
              <VStack space={"md"} className='items-end'>
                <HStack className='items-center' space={"sm"}>
                  <Text size='6xl'>
                    {Intl.NumberFormat().format(amountInSats)}
                  </Text>
                </HStack>
                <PosComponent value={amountInSats} onChange={setAmountInSats} />
              </VStack>
              <VStack space={"md"}>
                <Button onPress={() => setShowQrCode(true)} action={"positive"}>
                  <ButtonText>
                    {amountInSats ? "Show QR" : "Show without amount"}
                  </ButtonText>
                </Button>
                <Button
                  variant={"link"}
                  action='negative'
                  onPress={() => {
                    setOpen(false);
                    setAmountInSats(0);
                  }}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
              </VStack>
            </VStack>
          ) : (
            match(walletAddressMutation)
              .with({ isPending: true }, () => (
                <HStack space={"sm"} className='items-center'>
                  <Spinner />
                  <P>Generating QR</P>
                </HStack>
              ))
              .with({ isError: true }, () => <P>Error</P>)
              .with({ isSuccess: true }, ({ data }) => {
                if (!data) return <P>No wallet generated</P>;
                return (
                  <VStack space={"xl"} className='w-full'>
                    {!transaction ? (
                      <>
                        <QrCarousel
                          onAddressChange={setCurrentAddress}
                          paymentOptions={[
                            {
                              type: "normal",
                              address: data.paymentAddress,
                            },
                            ...(data.lnInvoice?.invoice
                              ? [
                                  {
                                    type: "ln invoice" as const,
                                    address: data.lnInvoice.invoice,
                                  },
                                ]
                              : []),
                          ]}
                        />

                        <Button
                          disabled={true}
                          variant={"link"}
                          action='secondary'
                        >
                          <Spinner />
                          <ButtonText>Waiting payment notification</ButtonText>
                        </Button>
                        {currentAddress && (
                          <Button
                            variant={"outline"}
                            onPress={() => copyToClipboard(currentAddress)}
                          >
                            <ButtonText>Copy to clipboard</ButtonText>
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {match(transaction)
                          .with({ type: "utxo" }, (coin) => (
                            <>
                              {map(coin.coins, (newCoin) => (
                                <Input
                                  key={newCoin.txid}
                                  isDisabled
                                  size={"sm"}
                                  className='h-max py-3'
                                >
                                  <InputField
                                    value={toString(newCoin.txid)}
                                    multiline
                                  />
                                </Input>
                              ))}
                              <Button onPress={backToDashboard}>
                                <ButtonText>Back to dashboard</ButtonText>
                                <ButtonIcon as={LayoutDashboard} />
                              </Button>
                            </>
                          ))
                          .with({ type: "vtxo" }, (coin) =>
                            map(coin.newVtxos, (vtxo) => (
                              <Input
                                key={vtxo.txid}
                                isDisabled
                                size={"sm"}
                                className='h-max py-3'
                              >
                                <InputField
                                  value={toString(vtxo.txid)}
                                  multiline
                                />
                              </Input>
                            )),
                          )
                          .otherwise(() => null)}
                        <Button onPress={backToDashboard}>
                          <ButtonText>Back to dashboard</ButtonText>
                          <ButtonIcon as={LayoutDashboard} />
                        </Button>
                      </>
                    )}
                  </VStack>
                );
              })
              .otherwise(({ status }) => <P>{status}</P>)
          )}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
