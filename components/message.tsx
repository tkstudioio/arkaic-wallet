import { Card } from "@/components/ui/card";
import { Large, Muted, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import useAccountStore from "@/stores/account";
import { Message } from "@/types/backend";
import { format, formatDistanceToNowStrict } from "date-fns";

import { match } from "ts-pattern";
import { AmountComponent } from "./amount";
import { Badge, BadgeText } from "./ui/badge";

export function MessageComponent(props: { message: Message }) {
  const { pubkey } = useAccountStore();

  if (props.message.isSystem) {
    return (
      <Muted className='text-center'>
        {format(new Date(props.message.sentAt), "dd/MM/yyyy HH:mm")}{" "}
        {props.message.message}
      </Muted>
    );
  }

  const isSender = props.message.senderPubkey === pubkey;

  return (
    <VStack
      space={"md"}
      className={
        isSender ? "self-end w-max max-w-[85%]" : "self-start w-max max-w-[85%]"
      }
    >
      {props.message.message && (
        <Card>
          <P className={isSender ? "text-right" : ""}>
            {props.message.message}
          </P>
          <Small className={isSender ? "text-right" : ""}>
            {formatDistanceToNowStrict(props.message.sentAt)}
          </Small>
        </Card>
      )}

      {match(props.message.offer)
        .with(undefined, null, () => null)
        .otherwise((offer) => (
          <Card
            className={
              offer.acceptance
                ? offer.acceptance.accepted
                  ? "border border-arkaic-positive"
                  : "border border-arkaic-negative"
                : "border border-arkaic-border"
            }
          >
            <VStack
              className={isSender ? "items-end" : "items-start"}
              space={"md"}
            >
              {match(offer.acceptance)
                .with({ accepted: true }, () => (
                  <Badge size={"xl"} action='success'>
                    <BadgeText>Accepted</BadgeText>
                  </Badge>
                ))
                .with({ accepted: false }, () => (
                  <Badge size={"xl"} action='error'>
                    <BadgeText>Rejected</BadgeText>
                  </Badge>
                ))
                .otherwise(() => (
                  <Badge size={"xl"}>
                    <BadgeText>Waiting seller</BadgeText>
                  </Badge>
                ))}

              <Large className={isSender ? "text-right" : ""}>
                {isSender ? "You have" : "Buyer has"} sent an offer
              </Large>
              <AmountComponent amount={offer.price} size='4xl' />
              <Small className={isSender ? "text-right" : ""}>
                {formatDistanceToNowStrict(props.message.sentAt)}
              </Small>
            </VStack>
          </Card>
        ))}
    </VStack>
  );
}
