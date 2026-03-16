import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Copy, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";

import PosComponent from "./pos";

import { usePaymentAddress } from "@/hooks/wallet/use-payment-address";
import useAccountStore from "@/stores/account";
import { IncomingFunds } from "@arkade-os/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { map, toString } from "lodash";
import { match } from "ts-pattern";
import { Input, InputField } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Large, P } from "./ui/typography";
import { VStack } from "./ui/vstack";

import { useAspInfo } from "@/hooks/use-asp-info";
import { useCopyToClipboard } from "@/hooks/use-clipboard";
import { Toast } from "toastify-react-native";
import { AmountComponent } from "./amount";
import { QrCarousel } from "./qr-carousel";
import { HStack } from "./ui/hstack";
import { CloseIcon } from "./ui/icon";

export function ReceiveActionSheet() {
  const { arkadeLightning } = useAccountStore();
  const queryClient = useQueryClient();
  const walletAddressMutation = usePaymentAddress();
  const { mutate: copyToClipboard } = useCopyToClipboard();
  const { wallet } = useAccountStore();
  const { data: aspInfo } = useAspInfo();

  const [open, setOpen] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);

  const [transaction, setTransaction] = useState<IncomingFunds | undefined>(
    undefined,
  );
  const [amountInSats, setAmountInSats] = useState<number>(0);
  const [currentAddress, setCurrentAddress] = useState<string | undefined>();

  useEffect(() => {
    if (!wallet) return;
    const stopListening = wallet.notifyIncomingFunds((transaction) => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setTransaction(transaction);
    });

    return () => {
      stopListening.then();
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
          console.error(e);
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
      <Button action={"primary"} onPress={() => setOpen(true)}>
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
              <P>Type an amount or leave empty</P>
            </VStack>
          ) : transaction ? (
            <VStack className='items-center'>
              <Large>Payment fulfilled</Large>
              <P>You have an incoming transaction</P>
            </VStack>
          ) : (
            <VStack className='items-center'>
              <Large>Payment</Large>
              <P>Show payment request</P>
            </VStack>
          )}

          {!showQrCode ? (
            <VStack space={"4xl"}>
              <VStack space={"md"} className='items-end'>
                <AmountComponent size='5xl' amount={amountInSats} />
                <PosComponent
                  value={amountInSats}
                  onChange={(amount) => setAmountInSats(amount || 0)}
                />
              </VStack>
              <VStack space={"md"}>
                <Button
                  onPress={() => {
                    if (amountInSats > 0 && aspInfo?.dust != null) {
                      const dustLimit = Number(aspInfo.dust);
                      if (amountInSats < dustLimit) {
                        Toast.error(
                          `Amount must be at least ${dustLimit} sats`,
                        );
                        return;
                      }
                    }
                    setShowQrCode(true);
                  }}
                  action={"positive"}
                  variant={"outline"}
                >
                  <ButtonText>
                    {amountInSats ? "Show QR" : "Show without amount"}
                  </ButtonText>
                </Button>
                <Button
                  action='neutral'
                  variant={"link"}
                  onPress={() => {
                    setOpen(false);
                    setAmountInSats(0);
                  }}
                >
                  <ButtonIcon as={CloseIcon} />
                  <ButtonText>Close</ButtonText>
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
                    {
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
                          .with(undefined, () => (
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

                              {currentAddress && (
                                <Button
                                  action={"neutral"}
                                  variant={"outline"}
                                  onPress={() =>
                                    copyToClipboard(currentAddress)
                                  }
                                >
                                  <ButtonText>Copy to clipboard</ButtonText>
                                  <ButtonIcon as={Copy} />
                                </Button>
                              )}
                              <HStack space={"md"} className='mx-auto'>
                                <Spinner />
                                <P>Waiting payment notification</P>
                              </HStack>
                            </>
                          ))
                          .otherwise(() => null)}
                      </>
                    }
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
