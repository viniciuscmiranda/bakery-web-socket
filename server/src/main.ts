import { WebSocketServer } from "./servers/websocket-server";
import { HttpServer } from "./servers/http-server";
import { MessageBroker } from "./services/message-broker";

new WebSocketServer(8080).listen();
new HttpServer(3000).listen();

MessageBroker.send("Hello World!", "startup");
