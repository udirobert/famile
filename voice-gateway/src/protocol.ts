export type ClientStart = {
  type: "start";
  encoding: "pcm_s16le";
  sample_rate: 16000;
  channels: 1;
  language?: string;
};

export type ClientControl = { type: "stop" };

export type GatewayEvent =
  | { type: "ready" }
  | { type: "transcript"; text: string; final: boolean }
  | { type: "ended" }
  | { type: "error"; error: string };

export function parseClientMessage(value: string): ClientStart | ClientControl | null {
  try {
    const message = JSON.parse(value) as {
      type?: string;
      encoding?: string;
      sample_rate?: number;
      channels?: number;
      language?: string;
    };
    if (message.type === "stop") return { type: "stop" };
    if (
      message.type === "start" &&
      message.encoding === "pcm_s16le" &&
      message.sample_rate === 16000 &&
      message.channels === 1
    ) {
      const parsed: ClientStart = {
        type: "start",
        encoding: "pcm_s16le",
        sample_rate: 16000,
        channels: 1,
      };
      if (message.language) parsed.language = message.language;
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function speechmaticsEvent(value: string): GatewayEvent | null {
  try {
    const message = JSON.parse(value) as {
      message?: string;
      reason?: string;
      type?: string;
      metadata?: { transcript?: string };
    };
    if (message.message === "RecognitionStarted") return { type: "ready" };
    if (message.message === "EndOfTranscript") return { type: "ended" };
    if (
      message.message === "AddPartialTranscript" ||
      message.message === "AddTranscript"
    ) {
      const text = message.metadata?.transcript?.trim();
      if (!text) return null;
      return {
        type: "transcript",
        text,
        final: message.message === "AddTranscript",
      };
    }
    if (message.message === "Error" || message.type === "Error") {
      return { type: "error", error: message.reason ?? "Transcription failed." };
    }
    return null;
  } catch {
    return null;
  }
}
