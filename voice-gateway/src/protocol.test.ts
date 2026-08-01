import test from "node:test";
import assert from "node:assert/strict";
import { parseClientMessage, speechmaticsEvent } from "./protocol.js";

test("parses the browser start message", () => {
  assert.deepEqual(
    parseClientMessage(
      JSON.stringify({ type: "start", encoding: "pcm_s16le", sample_rate: 16000, channels: 1 }),
    ),
    { type: "start", encoding: "pcm_s16le", sample_rate: 16000, channels: 1 },
  );
});

test("normalizes partial and final Speechmatics transcripts", () => {
  assert.deepEqual(
    speechmaticsEvent(
      JSON.stringify({ message: "AddPartialTranscript", metadata: { transcript: "hello" } }),
    ),
    { type: "transcript", text: "hello", final: false },
  );
  assert.deepEqual(
    speechmaticsEvent(
      JSON.stringify({ message: "AddTranscript", metadata: { transcript: "hello there" } }),
    ),
    { type: "transcript", text: "hello there", final: true },
  );
  assert.deepEqual(
    speechmaticsEvent(JSON.stringify({ message: "EndOfTranscript" })),
    { type: "ended" },
  );
});
