import { useMessagesWebsocket } from "../../hooks/use-messages-websocket";
import { useMessagesServerSentEvents } from "../../hooks/use-messages-server-sent-events";
import { Chat } from "../chat/chat";
import { useMessagesLongPolling } from "../../hooks/use-messages-long-polling";
import { useMessagesPolling } from "../../hooks/use-messages-polling";
import { useCreateMessage } from "../../hooks/use-create-message";

type IntegratedChatProps = Partial<React.ComponentProps<typeof Chat>>;

export const ChatWebsocket = (props: IntegratedChatProps) => {
  const {
    data: messages,
    isLoading,
    isConnected,
    sendMessage,
  } = useMessagesWebsocket();

  return (
    <Chat
      messages={messages}
      isLoading={isLoading}
      isConnected={isConnected}
      onSendMessage={sendMessage}
      {...props}
    />
  );
};

export const ChatServerSentEvents = (props: IntegratedChatProps) => {
  const {
    data: messages,
    isLoading,
    isConnected,
  } = useMessagesServerSentEvents();

  const { mutate: createMessage, isPending } = useCreateMessage();

  return (
    <Chat
      messages={messages}
      isLoading={isLoading}
      isConnected={isConnected}
      onSendMessage={createMessage}
      isSending={isPending}
      {...props}
    />
  );
};

export const ChatLongPolling = (props: IntegratedChatProps) => {
  const { data: messages, isLoading, isFetching } = useMessagesLongPolling();
  const { mutate: createMessage, isPending } = useCreateMessage();

  return (
    <Chat
      messages={messages}
      isLoading={isLoading}
      onSendMessage={createMessage}
      isSending={isPending}
      isFetching={isFetching}
      {...props}
    />
  );
};

export const ChatPolling = (props: IntegratedChatProps) => {
  const { data: messages, isLoading, isFetching } = useMessagesPolling();
  const { mutate: createMessage, isPending } = useCreateMessage();

  return (
    <Chat
      messages={messages}
      isLoading={isLoading}
      onSendMessage={createMessage}
      isSending={isPending}
      isFetching={isFetching}
      {...props}
    />
  );
};
