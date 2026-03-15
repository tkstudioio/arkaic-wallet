import useAccountStore from "@/stores/account";
import { Chat, Offer } from "@/types/backend";
import { BuyerActions } from "./buyer-actions";
import { SellerOfferActions } from "./seller-offer-actions";

type ChatActionsProps = {
  chat: Chat;
  activeOffer: Offer | null;
  hasEscrow?: boolean;
};

export function ChatActions({
  chat,
  activeOffer,
  hasEscrow,
}: ChatActionsProps) {
  const { pubkey } = useAccountStore();

  const isBuyer = chat.buyerPubkey === pubkey;

  if (isBuyer) {
    return (
      <BuyerActions
        chat={chat}
        activeOffer={activeOffer}
        hasEscrow={hasEscrow}
      />
    );
  }

  if (activeOffer) {
    return <SellerOfferActions activeOffer={activeOffer} chatId={chat.id} />;
  }

  return null;
}
