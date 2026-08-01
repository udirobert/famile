# Famile voice platform direction

**Status:** Initial transport implemented; provider-backed deployment pending.

TrueVoice is a useful reference implementation for a real-time voice
pipeline: browser audio capture, 16 kHz PCM streaming, parallel transcription
and analysis, ephemeral rooms, per-session events, and an end-of-session
summary. See [TrueVoice](https://github.com/omorros/TrueVoice).

Famile should reuse those patterns selectively. The shared platform is for
voice as an input and interaction surface for Mira, not for inferring a
person's honesty, mood, distress, diagnosis, or treatment need from their
voice.

## Reusable patterns

- `AudioWorklet` capture and downsampling in the browser.
- A streaming transport with short binary audio frames and reconnect support.
- A session/room abstraction with explicit ownership and expiry.
- Fan-out from one audio stream to transcription and other approved consumers.
- A typed event stream for transcript turns, agent activity, posture changes,
  consent changes, and escalation proposals.
- Ephemeral audio by default; persistence must be explicit and bounded.
- A final structured summary generated from attributable events rather than
  from an opaque conversation blob.
- A provider adapter boundary so transcription, language models, and optional
  speech output can change without changing product domains.

## Not adopted from TrueVoice

- Voice biomarkers as a clinical or psychological signal.
- A concordance score that treats vocal expression as evidence that a person
  is minimising or concealing something.
- Diagnostic, triage, or treatment conclusions from audio.
- A clinical evidence report without validated measures, consent, governance,
  and a human review path.

TrueVoice describes itself as a research-grade hackathon prototype and not a
medical device. Its repository also does not currently present a clear
commercial-use license, so its code is a reference until the authors clarify
the licensing position; do not copy it into a product by default.

## Product adoption

| Product | First useful voice slice | Boundary |
|---|---|---|
| Famile | Voice Mira: speak, transcribe, respond, and project operational posture | No inferred emotion or health interpretation |
| Orbura | Voice recovery check-in and concise observation capture | Self-report and explicit context remain authoritative |
| Sukari | Voice journaling and low-friction mission reflection | Deterministic programme logic owns safety and escalation |
| Ardum | Voice intention capture and reflective continuity | Episode state remains authoritative; voice is an input surface |

## Proposed sequence

1. [x] Prove browser voice capture → transcription → Mira response on Famile.
2. [ ] Emit the same typed Mira events used by the orb and shared memory model.
3. [x] Add explicit consent, visible recording state, cancellation, and deletion
   semantics before persistence or cross-device continuity.
4. [x] Add a server-side gateway boundary and normalize provider events.
5. [ ] Extract transport and event contracts only after two products need them.
6. [ ] Consider speech output and richer analysis as separate, opt-in capabilities.

### Current implementation

- Famile's Ask surface has a native browser speech fallback.
- The explicit path uses `AudioWorklet` capture and mono 16 kHz PCM16 frames.
- `web/voice-gateway/` validates short-lived tickets and proxies sessions to
  Speechmatics without exposing provider credentials to the browser.
- Partial and final Speechmatics transcript events are normalized into the
  client protocol.
- The gateway has unit coverage for client-start parsing and transcript
  normalization.

### Before provider-backed deployment

- Configure a real Speechmatics WebSocket endpoint and credentials in the
  gateway environment.
- Exercise the connection with Famile phrases and measure partial latency,
  finalization latency, accuracy, failure rate, and cost per minute.
- Add explicit final-utterance handling so interim text never submits to Mira.
- Add retention/deletion language once transcript persistence is introduced.

## Initial transport contract

Famile's explicit browser transport uses an `AudioWorklet` to downsample
microphone input to mono 16 kHz PCM16 and sends 640-sample (40 ms) binary
frames over a configured `wss://` endpoint. The client sends this JSON message
first:

```json
{"type":"start","encoding":"pcm_s16le","sample_rate":16000,"channels":1}
```

The server may reply with JSON transcript events such as:

```json
{"type":"transcript","text":"What are you noticing?","final":true}
```

or an error:

```json
{"type":"error","error":"Transcription unavailable"}
```

The endpoint is supplied server-side through `VOICE_GATEWAY_URL`, and its
non-secret public URL is also exposed as `NEXT_PUBLIC_VOICE_WS_URL` so the
client can show the explicit voice control. The browser gets a short-lived
ticket from `/api/voice/session`; provider credentials never enter the browser.
The browser-managed speech recognizer remains the development fallback when no
gateway is configured.

The first gateway lives in `web/voice-gateway/`. It validates the ticket,
connects to Speechmatics, sends the provider's `StartRecognition` configuration,
forwards binary audio, and normalizes partial/final transcript events. Its
Speechmatics adapter is intentionally isolated so another provider can be
benchmarked without changing the Famile client.

The first implementation should fit the existing Mira contract in
[`MIRA.md`](./MIRA.md), especially its operational posture rule and safety
charter.
