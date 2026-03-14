import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import useAccountStore from "@/stores/account";
import { Message } from "@/types/backend";
import { formatDistanceToNowStrict } from "date-fns";
import { first } from "lodash";
import { AmountComponent } from "./amount";

export function MessageComponent(props: { message: Message }) {
  const { pubkey } = useAccountStore();
  const isSender = props.message.senderPubkey === pubkey;

  return (
    <VStack space={"md"}>
      <Card
        variant={"outline"}
        className={
          isSender
            ? "ml-arkaic-xl flex justify-end items-end bg-arkaic-fill"
            : "mr-arkaic-xl bg-arkaic-fill border-arkaic-primary"
        }
      >
        {props.message.message && (
          <P className={isSender ? "text-right" : ""}>
            {props.message.message}
          </P>
        )}

        {props.message.offer && (
          <VStack className='items-end' space={"md"}>
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
