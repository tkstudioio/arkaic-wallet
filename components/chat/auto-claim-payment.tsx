import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { useSellerSignCheckpoints } from "@/hooks/escrows/use-seller-sign-checkpoints";
import { useEffect } from "react";
import { match } from "ts-pattern";

export function AutoClaimPayment(props: {
  escrowAddress: string;
  chatId: number;
}) {
  const sellerSignCheckpoints = useSellerSignCheckpoints();

  useEffect(() => {
    sellerSignCheckpoints.mutate({
      escrowAddress: props.escrowAddress,
      chatId: props.chatId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return match(sellerSignCheckpoints)
    .with({ isError: true }, () => (
      <Button
        onPress={() =>
          sellerSignCheckpoints.mutate({
            escrowAddress: props.escrowAddress,
            chatId: props.chatId,
          })
        }
      >
        <ButtonText>Claim payment</ButtonText>
      </Button>
    ))
    .with({ isPending: true }, () => <Spinner />)
    .otherwise(() => null);
}
