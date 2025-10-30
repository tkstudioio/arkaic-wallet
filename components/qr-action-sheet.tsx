import { LayoutDashboard } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Button, ButtonIcon, ButtonText } from "./ui/button";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
} from "@/components/ui/actionsheet";

import { usePaymentAddress } from "@/hooks/use-payment-address";
import useProfileStore from "@/stores/profile";
import { IncomingFunds } from "@arkade-os/sdk";
import { useTheme } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { map, toString } from "lodash";
import QRCode from "react-native-qrcode-skia";
import { match } from "ts-pattern";
import { Heading } from "./ui/heading";
import { Input, InputField } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export default function QRActionSheet(props: { amount?: number }) {
  const { wallet } = useProfileStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [transaction, setTransaction] = useState<IncomingFunds | undefined>(
    undefined
  );
  const walletAddressMutation = usePaymentAddress();
  const { colors } = useTheme();

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    walletAddressMutation.mutate(props.amount);
  }, [props.amount]);

  useEffect(() => {
    if (!wallet) return;
    wallet.notifyIncomingFunds(setTransaction);
  }, []);

  function backToDashboard() {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    router.replace("/dashboard");
    setOpen(false);
  }

  return (
    <>
      <Button onPress={() => setOpen(true)}>
        <ButtonText>Create payment request</ButtonText>
      </Button>
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-6 pt-6'>
          <VStack className='items-center'>
            {transaction ? (
              <>
                <Heading>Payment fulfilled</Heading>
                <Text>You have an incoming transaction</Text>
              </>
            ) : (
              <>
                <Heading>QR Generated</Heading>
                <Text>Show your receiving address</Text>
              </>
            )}
          </VStack>
          {match(walletAddressMutation)
            .with({ isPending: true }, () => <Spinner />)
            .with({ isSuccess: true }, ({ data }) => {
              if (!data) return <Text>No wallet generated</Text>;

              return (
                <VStack space={"xl"} className='w-full'>
                  {transaction ? (
                    <></>
                  ) : (
                    <QRCode
                      value={data}
                      size={256}
                      color={colors.text}
                      shapeOptions={{
                        shape: "square",
                        eyePatternShape: "square",
                        eyePatternGap: 0,
                        gap: 0,
                      }}
                    />
                  )}

                  {match(transaction)
                    .with(undefined, () => (
                      <>
                        <Input
                          isDisabled
                          size={"sm"}
                          className='h-max py-3'
                          variant={"underlined"}
                        >
                          <InputField value={data} multiline />
                        </Input>
                        <Button disabled={true} variant={"link"}>
                          <Spinner />
                          <ButtonText>Waiting payment notification</ButtonText>
                        </Button>
                      </>
                    ))
                    .with({ type: "utxo" }, (coin) => (
                      <>
                        {map(coin.coins, (newCoin) => (
                          <Input
                            key={newCoin.txid}
                            isDisabled
                            size={"sm"}
                            className='h-max py-3'
                            variant={"underlined"}
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
                    .otherwise((coin) => (
                      <>
                        {map(coin.newVtxos, (vtxo) => (
                          <Input
                            key={vtxo.txid}
                            isDisabled
                            size={"sm"}
                            className='h-max py-3'
                            variant={"underlined"}
                          >
                            <InputField value={toString(vtxo.txid)} multiline />
                          </Input>
                        ))}
                        <Button onPress={backToDashboard}>
                          <ButtonText>Back to dashboard</ButtonText>
                          <ButtonIcon as={LayoutDashboard} />
                        </Button>
                      </>
                    ))}
                </VStack>
              );
            })

            .otherwise(() => (
              <Spinner />
            ))}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
