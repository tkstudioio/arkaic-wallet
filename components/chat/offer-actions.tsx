import { useChatOffer } from "@/hooks/chats/use-chat-offer";
import useAccountStore from "@/stores/account";
import { Chat } from "@/types/backend";
import { match } from "ts-pattern";
import { AmountComponent } from "../amount";
import { BuyListing } from "../listing/buy-listing";
import { CreateOffer } from "./create-offer";
import { SellerOfferActions } from "./seller-offer-actions";

export function OfferActions(props: { chat: Chat }) {
  const { pubkey } = useAccountStore();
  const chatOfferQuery = useChatOffer(props.chat.id);

  const isBuyer = props.chat.buyerPubkey === pubkey;

  const noOfferUI = match(isBuyer)
    .with(true, () => (
      <>
        <CreateOffer chat={props.chat} />
        <BuyListing chat={props.chat} price={props.chat.listing?.price} />
      </>
    ))
    .otherwise(() => null);

  return match(chatOfferQuery)
    .with({ isSuccess: true, data: null }, () => noOfferUI)
    .with({ isSuccess: true }, ({ data }) =>
      match(isBuyer)
        .with(true, () => (
          <>
            {match({ acceptance: data!.acceptance, valid: data!.valid })
              .with({ acceptance: { accepted: true } }, () => (
                <AmountComponent amount={data!.price} size='4xl' />
              ))
              .with(
                { acceptance: { accepted: false } },
                { valid: false },
                { acceptance: undefined },
                () => <CreateOffer chat={props.chat} />,
              )

              .otherwise(() => null)}
            <BuyListing
              chat={props.chat}
              isOffer={data!.acceptance?.accepted}
              price={
                data!.acceptance?.accepted
                  ? data!.price
                  : props.chat.listing?.price
              }
            />
          </>
        ))
        .otherwise(() => (
          <SellerOfferActions chatId={props.chat.id} activeOffer={data!} />
        )),
    )
    .otherwise(() => null);
}
