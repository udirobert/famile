import { createGatewayServer } from "./gateway.js";

const speechmaticsUrl = process.env.SPEECHMATICS_WS_URL?.trim();
const speechmaticsKey = process.env.SPEECHMATICS_API_KEY?.trim();
const gatewaySecret = process.env.VOICE_GATEWAY_SECRET?.trim();

if (!speechmaticsUrl || !speechmaticsKey || !gatewaySecret) {
  throw new Error(
    "SPEECHMATICS_WS_URL, SPEECHMATICS_API_KEY, and VOICE_GATEWAY_SECRET are required",
  );
}

const allowedOrigins = (process.env.VOICE_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const server = createGatewayServer({
  speechmaticsUrl,
  speechmaticsKey,
  gatewaySecret,
  allowedOrigins,
});

server.listen(Number(process.env.PORT ?? 8787), () => {
  console.log("Famile voice gateway listening");
});
