import { createServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { validTicket } from "./auth.js";
import { parseClientMessage, speechmaticsEvent, type ClientStart } from "./protocol.js";

const port = Number(process.env.PORT ?? 8787);
const path = "/v1/stream";
const speechmaticsUrl = process.env.SPEECHMATICS_WS_URL?.trim();
const speechmaticsKey = process.env.SPEECHMATICS_API_KEY?.trim();
const gatewaySecret = process.env.VOICE_GATEWAY_SECRET?.trim();
const allowedOrigins = new Set(
  (process.env.VOICE_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

if (!speechmaticsUrl || !speechmaticsKey || !gatewaySecret) {
  throw new Error(
    "SPEECHMATICS_WS_URL, SPEECHMATICS_API_KEY, and VOICE_GATEWAY_SECRET are required",
  );
}

const speechmaticsEndpoint = speechmaticsUrl;
const speechmaticsToken = speechmaticsKey;
const ticketSecret = gatewaySecret;

const gateway = new WebSocketServer({ noServer: true, maxPayload: 128 * 1024 });

gateway.on("connection", (client) => {
  let upstream: WebSocket | null = null;
  let started = false;
  let upstreamReady = false;
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
      if (upstream?.readyState === WebSocket.OPEN) {
        upstream.send(JSON.stringify({ message: "EndOfStream" }));
      }
      return;
    }
    if (started) return;
    started = true;
    startUpstream(message);
  });

  function startUpstream(config: ClientStart) {
    upstream = new WebSocket(speechmaticsEndpoint, {
      headers: { Authorization: `Bearer ${speechmaticsToken}` },
    });
    startTimer = setTimeout(() => fail("Transcription connection timed out."), 10_000);
    upstream.on("open", () => {
      upstream?.send(
        JSON.stringify({
          message: "StartRecognition",
          transcription_config: {
            language: config.language ?? process.env.SPEECHMATICS_LANGUAGE ?? "en",
            enable_partials: true,
            max_delay: 1,
          },
          audio_format: {
            type: "raw",
            encoding: "pcm_s16le",
            sample_rate: 16000,
          },
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
    url.pathname !== path ||
    (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) ||
    !validTicket(ticket, ticketSecret)
  ) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  gateway.handleUpgrade(request, socket, head, (client) => {
    gateway.emit("connection", client, request);
  });
});

server.listen(port, () => {
  console.log(`Famile voice gateway listening on :${port}`);
});
