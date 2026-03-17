import useAccountStore from "@/stores/account";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

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

let ws: WebSocket | null = null;
let refCount = 0;

function connect(token: string) {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws;
  }

  ws = new WebSocket(`${WS_URL}?token=${token}`);

  ws.onopen = () => console.log("[WebSocket] connected");
  ws.onclose = (e) => {
    console.log("[WebSocket] closed", e.code, e.reason);
    ws = null;
  };
  ws.onerror = () => console.error("[WebSocket] error");

  return ws;
}

function disconnect() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function useWebSocket() {
  const token = useAccountStore((s) => s.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    refCount++;
    const socket = connect(token);

    const handleMessage = (event: MessageEvent) => {
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

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
      refCount--;
      if (refCount <= 0) {
        refCount = 0;
        disconnect();
      }
    };
  }, [token, queryClient]);
}
