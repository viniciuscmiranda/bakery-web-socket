import { WebSocketServer } from "./servers/websocket-server";
import { HttpServer } from "./servers/http-server";

new WebSocketServer(8080).listen();
new HttpServer(3000).listen();
