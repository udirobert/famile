import { createServer, type Server } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { validTicket } from "./auth.js";
import { parseClientMessage, speechmaticsEvent, type ClientStart } from "./protocol.js";

export type GatewayConfig = {
  speechmaticsUrl: string;
  speechmaticsKey: string;
  gatewaySecret: string;
  allowedOrigins?: string[];
};

export function createGatewayServer(config: GatewayConfig): Server {
  const allowedOrigins = new Set(config.allowedOrigins ?? []);
  const gateway = new WebSocketServer({ noServer: true, maxPayload: 128 * 1024 });

  gateway.on("connection", (client) => {
    let upstream: WebSocket | null = null;
    let started = false;
    let upstreamReady = false;
    let endRequested = false;
    let startTimer: NodeJS.Timeout | undefined;

    const send = (value: unknown) => {
      if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(value));
    };
    const fail = (message: string) => {
      send({ type: "error", error: message });
      client.close(1011, message);
    };

    client.on("message", (raw, isBinary) => {
      if (isBinary) {
        if (upstreamReady && upstream?.readyState === WebSocket.OPEN) upstream.send(raw);
        return;
      }
      const message = parseClientMessage(raw.toString());
      if (!message) {
        fail("Invalid voice session message.");
        return;
      }
      if (message.type === "stop") {
        if (!endRequested && upstream?.readyState === WebSocket.OPEN) {
          endRequested = true;
          upstreamReady = false;
          upstream.send(JSON.stringify({ message: "EndOfStream" }));
        }
        return;
      }
      if (started) return;
      started = true;
      startUpstream(message);
    });

    function startUpstream(start: ClientStart) {
      upstream = new WebSocket(config.speechmaticsUrl, {
        headers: { Authorization: `Bearer ${config.speechmaticsKey}` },
      });
      startTimer = setTimeout(() => fail("Transcription connection timed out."), 10_000);
      upstream.on("open", () => {
        upstream?.send(
          JSON.stringify({
            message: "StartRecognition",
            transcription_config: {
              language: start.language ?? "en",
              enable_partials: true,
              max_delay: 1,
            },
            audio_format: { type: "raw", encoding: "pcm_s16le", sample_rate: 16000 },
          }),
        );
      });
      upstream.on("message", (raw, isBinary) => {
        if (isBinary) return;
        const event = speechmaticsEvent(raw.toString());
        if (event) send(event);
        if (event?.type === "ready") {
          upstreamReady = true;
          if (startTimer) clearTimeout(startTimer);
        }
        if (event?.type === "error") client.close(1011, event.error);
        if (event?.type === "ended") client.close(1000, "Transcription ended");
      });
      upstream.on("error", () => fail("Transcription provider unavailable."));
      upstream.on("close", () => {
        if (client.readyState === WebSocket.OPEN) client.close(1000, "Transcription ended");
      });
    }

    client.on("close", () => {
      if (startTimer) clearTimeout(startTimer);
      upstream?.close();
    });
  });

  const server = createServer((request, response) => {
    if (request.url === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }
    response.writeHead(404);
    response.end();
  });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const origin = request.headers.origin;
    const ticket = url.searchParams.get("ticket") ?? undefined;
    if (
      url.pathname !== "/v1/stream" ||
      (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) ||
      !validTicket(ticket, config.gatewaySecret)
    ) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    gateway.handleUpgrade(request, socket, head, (client) => {
      gateway.emit("connection", client, request);
    });
  });

  return server;
}
