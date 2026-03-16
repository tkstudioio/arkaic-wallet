import useAccountStore from "@/stores/account";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const WS_URL = "ws://localhost:4000/ws";

type NewMessageEvent = {
  type: "new_message";
  chatId: number;
};

type NewOfferEvent = {
  type: "new_offer";
  chatId: number;
  price: number;
};

type OfferAcceptedEvent = {
  type: "offer_accepted";
  chatId: number;
  offerId: number;
};

type OfferRejectedEvent = {
  type: "offer_rejected";
  chatId: number;
  offerId: number;
};

type EscrowUpdateEvent = {
  type: "escrow_update";
  address: string;
};

type WsMessage =
  | NewMessageEvent
  | NewOfferEvent
  | OfferAcceptedEvent
  | OfferRejectedEvent
  | EscrowUpdateEvent;

export function useWebSocket() {
  const token = useAccountStore((s) => s.token);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("[WebSocket] connected");
    };

    ws.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data);

        if (
          message.type === "new_message" ||
          message.type === "new_offer" ||
          message.type === "offer_accepted" ||
          message.type === "offer_rejected"
        ) {
          const chatId = Number(message.chatId);
          queryClient.refetchQueries({ queryKey: ["chat", chatId] });
          queryClient.refetchQueries({ queryKey: ["active-offer", chatId] });
          queryClient.refetchQueries({ queryKey: ["chat-offer", chatId] });
        }

        if (message.type === "escrow_update") {
          queryClient.refetchQueries({ queryKey: ["escrow", message.address] });
          queryClient.refetchQueries({ queryKey: ["chat-escrow"] });
        }

        console.log("[WebSocket]", message.type);
      } catch {
        console.error("[WebSocket] failed to parse message", event.data);
      }
    };

    ws.onclose = (e) => {
      console.log("[WebSocket] closed", e.code, e.reason);
    };

    ws.onerror = () => {
      console.error("[WebSocket] error");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token, queryClient]);
}
