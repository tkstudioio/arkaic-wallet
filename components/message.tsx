import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Muted, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import useAccountStore from "@/stores/account";
import { Message } from "@/types/backend";
import { format, formatDistanceToNowStrict } from "date-fns";

import { first } from "lodash";
import { AmountComponent } from "./amount";

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
    <VStack space={"md"} className={isSender ? "self-end max-w-[80%]" : "self-start max-w-[80%]"}>
      <Card
        variant={"outline"}
        className={
          isSender
            ? "flex justify-end items-end bg-arkaic-fill"
            : "bg-arkaic-fill border-arkaic-primary"
        }
      >
        {props.message.message && (
          <P className={isSender ? "text-right" : ""}>
            {props.message.message}
          </P>
        )}

        {props.message.offer && (
          <VStack
            className={isSender ? "items-end" : "items-start"}
            space={"md"}
          >
            <P className={isSender ? "text-right" : ""}>
              {isSender ? "You have" : "Buyer has"} sent an offer
            </P>
            <AmountComponent amount={props.message.offer.price} size='4xl' />
          </VStack>
        )}
      </Card>
      <HStack
        space={"sm"}
        className={isSender ? "flex-row-reverse items-center" : "items-center"}
      >
        <Avatar size={"xs"}>
          <AvatarFallbackText>
            {first(props.message.sender?.username)}
          </AvatarFallbackText>
        </Avatar>
        <Small className={isSender ? "text-right" : ""}>
          {formatDistanceToNowStrict(props.message.sentAt)}
        </Small>
      </HStack>
    </VStack>
  );
}
