import { HandCoins, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Button, ButtonIcon, ButtonText } from "../ui/button";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
} from "@/components/ui/actionsheet";

import { usePaymentAddress } from "@/hooks/use-payment-address";
import { useTheme } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import QRCode from "react-native-qrcode-skia";
import { match } from "ts-pattern";
import { Heading } from "../ui/heading";
import { Input, InputField } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

export default function QRActionSheet(props: { amount?: number }) {
  const queryClient = useQueryClient();
  const walletAddressMutation = usePaymentAddress();
  const { colors } = useTheme();

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    walletAddressMutation.mutate(props.amount);
  }, [props.amount]);

  useEffect(() => {
    if (open) return;
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions-history"] });
  }, [queryClient, open]);

  return (
    <>
      <Button
        action={"positive"}
        className='flex-1 h-24'
        size={"xl"}
        onPress={() => setOpen(true)}
      >
        <HandCoins color={colors.background} />
        <ButtonText>Receive</ButtonText>
      </Button>
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-6 pt-6'>
          <VStack className='items-center'>
            <Heading>QR Generated</Heading>
            <Text>Show your receiving address</Text>
          </VStack>
          {match(walletAddressMutation)
            .with({ isPending: true }, () => <Spinner />)
            .with({ isSuccess: true }, ({ data }) => {
              if (!data) return <Text>No wallet generated</Text>;
              return (
                <VStack space={"xl"}>
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

                  <Input
                    isDisabled
                    size={"sm"}
                    className='h-max py-3'
                    variant={"underlined"}
                  >
                    <InputField value={data} multiline />
                  </Input>

                  <Button disabled={true} onPress={() => setOpen(false)}>
                    {/* must add payment subscriptions. waits for incoming transactions of this amount */}

                    {true ? (
                      <Spinner />
                    ) : (
                      <>
                        <ButtonText>Close</ButtonText>
                        <ButtonIcon as={X} />
                      </>
                    )}
                  </Button>
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
