import { Card } from "@/components/ui/card";
import { Large, P, Small } from "@/components/ui/typography";
import { useProduct } from "@/hooks/products/use-product";

import { AmountComponent } from "@/components/amount";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { useOpenChat } from "@/hooks/chats/use-open-chat";
import { useProductChats } from "@/hooks/chats/use-product-chats";
import { useSendMessage } from "@/hooks/chats/use-send-message";
import { useAcceptOfferMessage } from "@/hooks/chats/use-accept-offer-message";
import { useRejectOfferMessage } from "@/hooks/chats/use-reject-offer-message";
import { ChatMessage } from "@/types/product";
import { formatDistanceToNowStrict } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { first, map } from "lodash";
import { Handshake, Send } from "lucide-react-native";
import { useState } from "react";
import { match } from "ts-pattern";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productQuery = useProduct(id);
  const { mutateAsync: openChat, isPending: isOpeningChat } = useOpenChat();
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();
  const acceptOfferMessage = useAcceptOfferMessage();
  const rejectOfferMessage = useRejectOfferMessage();
  const productChatsQuery = useProductChats(id);
  const [text, setText] = useState("");
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");

  const chat = first(productChatsQuery.data);

  const handleSend = (counterOffer?: number) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const onSuccess = () => {
      setText("");
      setOfferPrice("");
      setShowCounterOfferModal(false);
    };

    if (chat) {
      sendMessage({
        chatId: chat.id,
        text: trimmed,
        offerPrice: counterOffer,
      }).then(onSuccess);
    } else if (productQuery.data) {
      openChat({
        productId: productQuery.data.id,
        text: trimmed,
        offerPrice: counterOffer,
      }).then(onSuccess);
    }
  };

  return match(productQuery)
    .with({ data: undefined }, () => null)
    .otherwise(({ data: product }) => (
      <VStack space='md'>
        <Card className='w-full'>
          <P>{product.seller?.accountName}</P>
          <Skeleton className='w-full h-max aspect-video' />
          <Large>{product.name}</Large>
          <P>Price: {product.price} sats</P>
        </Card>

        {chat &&
          map(chat.messages, (message) => (
            <Message
              key={message.id}
              message={message}
              currentUserId={chat.buyerId}
              onAcceptOffer={(messageId) =>
                acceptOfferMessage.mutate({ chatId: chat.id, messageId })
              }
              onRejectOffer={(messageId) =>
                rejectOfferMessage.mutate({ chatId: chat.id, messageId })
              }
              isPendingAction={acceptOfferMessage.isPending || rejectOfferMessage.isPending}
            />
          ))}

        <Card>
          <HStack className='w-full' space={"md"}>
            <Input className='flex-1 h-full'>
              <InputField
                placeholder='Type message...'
                value={text}
                onChangeText={setText}
                onSubmitEditing={() => handleSend()}
              />
            </Input>
            <Menu
              placement='top end'
              trigger={(triggerProps) => (
                <Button
                  className='w-max'
                  variant={"outline"}
                  isDisabled={!text.trim() || isSending || isOpeningChat}
                  {...triggerProps}
                >
                  <ButtonIcon as={Send} />
                </Button>
              )}
            >
              <MenuItem
                key='send'
                textValue='Invia'
                onPress={() => handleSend()}
              >
                <MenuItemLabel>Invia</MenuItemLabel>
              </MenuItem>
              <MenuItem
                key='counter-offer'
                textValue='Invia con contro offerta'
                onPress={() => setShowCounterOfferModal(true)}
              >
                <MenuItemLabel>Invia con contro offerta</MenuItemLabel>
              </MenuItem>
            </Menu>
          </HStack>
        </Card>

        <Modal
          isOpen={showCounterOfferModal}
          onClose={() => setShowCounterOfferModal(false)}
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size='md'>Contro offerta</Heading>
            </ModalHeader>
            <ModalBody>
              <Input>
                <InputField
                  keyboardType='numeric'
                  placeholder='Prezzo in sats'
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                />
              </Input>
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={() => handleSend(Number(offerPrice))}
                isDisabled={
                  !offerPrice || !text.trim() || isSending || isOpeningChat
                }
              >
                <ButtonText>Conferma</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    ));
}

function Message(props: {
  message: ChatMessage;
  currentUserId?: number;
  onAcceptOffer?: (messageId: number) => void;
  onRejectOffer?: (messageId: number) => void;
  isPendingAction?: boolean;
}) {
  const isSender = props.currentUserId != null && props.message.senderId === props.currentUserId;
  const canRespond =
    !isSender && props.message.offerStatus === "awaitingAccept";

  return (
    <Card
      variant={props.message?.offerPrice ? undefined : "outline"}
      className='border-dashed'
    >
      {props.message?.offerPrice ? (
        <VStack className={isSender ? "items-end" : "items-start"} space={"md"}>
          <HStack className='justify-between items-center w-full'>
            <P>Price proposal</P>
            {props.message.offerStatus && (
              <Badge
                size='sm'
                action={
                  props.message.offerStatus === "accepted"
                    ? "success"
                    : props.message.offerStatus === "rejected"
                      ? "error"
                      : "warning"
                }
              >
                <BadgeText>
                  {props.message.offerStatus === "accepted"
                    ? "Accepted"
                    : props.message.offerStatus === "rejected"
                      ? "Rejected"
                      : "Pending"}
                </BadgeText>
              </Badge>
            )}
          </HStack>
          <AmountComponent amount={props.message.offerPrice} size='3xl' />
          {props.message.text && <Small>{props.message.text}</Small>}
          {canRespond && (
            <HStack space='sm'>
              <Button
                variant={"outline"}
                action={"positive"}
                className='flex-1'
                onPress={() => props.onAcceptOffer?.(props.message.id)}
                isDisabled={props.isPendingAction}
              >
                <ButtonText>Accept</ButtonText>
                <ButtonIcon as={Handshake} />
              </Button>
              <Button
                variant={"outline"}
                action={"negative"}
                className='flex-1'
                onPress={() => props.onRejectOffer?.(props.message.id)}
                isDisabled={props.isPendingAction}
              >
                <ButtonText>Reject</ButtonText>
              </Button>
            </HStack>
          )}
        </VStack>
      ) : (
        <VStack space={"md"}>
          <P className={isSender ? "text-right" : "items-start"}>
            {props.message.text}{" "}
          </P>
          <Small className={isSender ? "text-right" : "items-start"}>
            {formatDistanceToNowStrict(props.message?.createdAt)}
          </Small>
        </VStack>
      )}
    </Card>
  );
}
