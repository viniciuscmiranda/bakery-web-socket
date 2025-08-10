import dotenv from "dotenv";

import { WebSocketServer } from "./servers/websocket-server";
import { HttpServer } from "./servers/http-server";

dotenv.config();

const wsPort = Number(process.env.WEBSOCKET_PORT) || 8080;
const wsServer = new WebSocketServer(wsPort);
wsServer.listen();

const httpPort = Number(process.env.HTTP_PORT) || 3000;
const httpServer = new HttpServer(httpPort);
httpServer.listen();
