# famile

Attention, evidence, and continuity for the long arc of staying well.

## Docs

- [docs/VISION.md](docs/VISION.md)
- [docs/VOICE.md](docs/VOICE.md)
- [docs/PRODUCTS.md](docs/PRODUCTS.md)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional voice gateway

The Ask surface works with native browser speech recognition by default. To
run the explicit AudioWorklet/WebSocket path, configure the server variables in
`.env.local`, install the gateway dependencies, and run the gateway separately:

```bash
cd voice-gateway
npm install
npm run dev
```

Set `VOICE_GATEWAY_URL`, `VOICE_GATEWAY_SECRET`, `SPEECHMATICS_WS_URL`, and
`SPEECHMATICS_API_KEY` in the web app/gateway environments. The gateway must
allow the Famile origin through `VOICE_ALLOWED_ORIGINS`.
