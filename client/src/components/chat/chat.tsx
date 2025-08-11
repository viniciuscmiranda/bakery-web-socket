import { useEffect, useRef, useState } from "react";

import type { Message } from "../../types/message";
import styles from "./chat.module.css";

type ChatProps = {
  messages: Message[];
  isLoading: boolean;
  isConnected?: boolean;
  isSending?: boolean;
  isFetching?: boolean;
  onSendMessage: (message: string) => void;
  addon?: React.ReactNode;
};

export const Chat = ({
  messages,
  isLoading = false,
  isConnected,
  isSending = false,
  isFetching = false,
  onSendMessage,
  addon,
}: ChatProps) => {
  const [enableServerMessages, setEnableServerMessages] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll para o final da lista de mensagens
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className={styles.container}>
      <div className={styles.warnings}>
        <label className={styles.serverMessagesToggle}>
          <input
            type="checkbox"
            checked={enableServerMessages}
            onChange={(e) => setEnableServerMessages(e.target.checked)}
          />
          <span>Logs</span>
        </label>

        {isLoading && <p className={styles.warning}>Carregando...</p>}
        {isFetching && <p className={styles.warning}>Atualizando...</p>}
        {isConnected !== undefined && (
          <p className={styles.warning}>
            {isConnected ? "Conectado" : "Desconectado"}
          </p>
        )}

        <div className={styles.addon}>{addon}</div>
      </div>

      <section className={styles.messages} ref={messagesContainerRef}>
        {messages?.map((message, index) => {
          if (message.clientId === "server") {
            if (!enableServerMessages) return null;

            return (
              <article className={styles.serverMessage} key={index}>
                <p>{message.message}</p>
              </article>
            );
          }

          return (
            <article className={styles.message} key={index}>
              <p>{message.message}</p>
              <footer className={styles.footer}>
                <span>{message.clientId}</span>
                <span>&bull;</span>
                <time>
                  {new Date(message.timestamp).toLocaleString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </time>
              </footer>
            </article>
          );
        })}
      </section>

      <Form onSubmit={onSendMessage} isSending={isSending} />
    </main>
  );
};

type FormProps = {
  onSubmit: (message: string) => void;
  isSending?: boolean;
};

const Form = ({ onSubmit, isSending }: FormProps) => {
  const [message, setMessage] = useState("");

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(message);
      }}
    >
      <input
        type="text"
        placeholder="Digite sua mensagem"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" disabled={isSending || !message.trim()}>
        {isSending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};
