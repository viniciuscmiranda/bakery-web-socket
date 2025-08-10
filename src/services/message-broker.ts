import { Logger } from "../utils/logger";

const logger = new Logger("✉️  MessageBroker");

type Subscriber = (message: Message) => void;

export type Message = {
  message: string;
  type: "message" | "error";
  timestamp: string;
};

export class MessageBrokerClass {
  private messages: Message[] = [];
  private subscribers: Set<Subscriber> = new Set();

  public send(message: string) {
    const messageObject: Message = {
      message,
      type: "message",
      timestamp: new Date().toISOString(),
    };

    logger.log(`Enviando mensagem: "${message}"`);

    this.messages.unshift(messageObject);
    this.subscribers.forEach((subscriber) => subscriber(messageObject));

    return messageObject;
  }

  public getMessages() {
    return this.messages;
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
  }

  public unsubscribe(subscriber: Subscriber) {
    this.subscribers.delete(subscriber);
  }
}

export const MessageBroker = new MessageBrokerClass();
