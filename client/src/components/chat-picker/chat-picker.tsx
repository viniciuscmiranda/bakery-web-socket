import { useState } from "react";
import {
  ChatLongPolling,
  ChatPolling,
  ChatServerSentEvents,
  ChatWebsocket,
} from "./integrated-chats";

import styles from "./chat-picker.module.css";

type ChatType = "polling" | "long-polling" | "sse" | "websocket";

export const ChatPicker = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const [chatType, setChatType] = useState<ChatType>(
    (searchParams.get("chat") as ChatType) || "polling"
  );

  const select = (
    <select
      className={styles.select}
      value={chatType}
      onChange={(e) => {
        setChatType(e.target.value as ChatType);
        searchParams.set("chat", e.target.value);
        window.location.search = searchParams.toString();
      }}
    >
      <option value="polling">Polling</option>
      <option value="long-polling">Long Polling</option>
      <option value="sse">Server-Sent Events</option>
      <option value="websocket">WebSocket</option>
    </select>
  );

  const chatComponents = {
    websocket: <ChatWebsocket addon={select} />,
    sse: <ChatServerSentEvents addon={select} />,
    polling: <ChatPolling addon={select} />,
    "long-polling": <ChatLongPolling addon={select} />,
  };

  return chatComponents[chatType];
};
