import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { WebSocket, WebSocketServer } from "ws";
import { createGatewayServer } from "./gateway.js";

function ticket(secret: string): string {
  const payload = `${Math.floor(Date.now() / 1000) + 60}.test-nonce`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

async function close(server: WebSocketServer | ReturnType<typeof createGatewayServer>) {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

test("drains final transcript events after client stop", async () => {
  const provider = new WebSocketServer({ port: 0 });
  await once(provider, "listening");
  const providerPort = (provider.address() as AddressInfo).port;
  const seen: string[] = [];

  provider.on("connection", (socket) => {
    socket.on("message", (raw, isBinary) => {
      if (isBinary) {
        seen.push("audio");
        return;
      }
      const message = JSON.parse(raw.toString()) as { message: string };
      if (message.message === "StartRecognition") {
        socket.send(JSON.stringify({ message: "RecognitionStarted" }));
      }
      if (message.message === "EndOfStream") {
        seen.push("end");
        socket.send(
          JSON.stringify({ message: "AddTranscript", metadata: { transcript: "final words" } }),
        );
        socket.send(JSON.stringify({ message: "EndOfTranscript" }));
      }
    });
  });

  const secret = "test-secret";
  const gateway = createGatewayServer({
    speechmaticsUrl: `ws://127.0.0.1:${providerPort}`,
    speechmaticsKey: "provider-key",
    gatewaySecret: secret,
  });
  gateway.listen(0);
  await once(gateway, "listening");
  const gatewayPort = (gateway.address() as AddressInfo).port;
  const client = new WebSocket(
    `ws://127.0.0.1:${gatewayPort}/v1/stream?ticket=${ticket(secret)}`,
  );
  const events: { type: string; text?: string; final?: boolean }[] = [];

  try {
    client.on("message", (raw) => {
      events.push(JSON.parse(raw.toString()) as { type: string; text?: string; final?: boolean });
    });
    await once(client, "open");
    client.send(JSON.stringify({ type: "start", encoding: "pcm_s16le", sample_rate: 16000, channels: 1 }));

    await new Promise<void>((resolve) => {
      client.on("message", (raw) => {
        if ((JSON.parse(raw.toString()) as { type?: string }).type === "ready") resolve();
      });
    });
    client.send(Buffer.from([1, 2, 3, 4]));
    client.send(JSON.stringify({ type: "stop" }));

    await new Promise<void>((resolve) => {
      client.on("message", (raw) => {
        if ((JSON.parse(raw.toString()) as { type?: string }).type === "ended") resolve();
      });
    });

    assert.deepEqual(seen, ["audio", "end"]);
    assert.deepEqual(events, [
      { type: "ready" },
      { type: "transcript", text: "final words", final: true },
      { type: "ended" },
    ]);
  } finally {
    client.close();
    await close(gateway);
    await close(provider);
  }
});
