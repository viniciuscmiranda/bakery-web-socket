import { Logger } from "../utils/logger";

type Subscriber = (message: Message) => void;

export class MessageBrokerClass {
  private messages: Message[] = [];
  private subscribers: Set<Subscriber> = new Set();
  private logger: Logger;

  constructor() {
    this.logger = new Logger("✉️  MessageBroker");
  }

  public send(message: Message) {
    this.logger.log(`Sending message: "${message.message}"`);

    this.messages.unshift(message);
    this.subscribers.forEach((subscriber) => subscriber(message));
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

export class Message {
  public timestamp: string;

  constructor(public type: "message" | "error", public message: string) {
    this.timestamp = new Date().toISOString();
  }

  public toJSON() {
    return {
      type: this.type,
      message: this.message,
      timestamp: this.timestamp,
    };
  }

  public toString() {
    return JSON.stringify(this.toJSON());
  }
}

export const MessageBroker = new MessageBrokerClass();
