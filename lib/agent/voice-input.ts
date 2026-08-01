"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type RecognitionAlternative = { transcript: string };
type RecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: RecognitionAlternative;
};
type RecognitionResultList = {
  length: number;
  [index: number]: RecognitionResult;
};

interface RecognitionEvent extends Event {
  results: RecognitionResultList;
}

interface RecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onstart: (() => void) | null;
}

type RecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

type ExplicitVoiceMode = "websocket" | "browser";

type VoiceServerEvent = {
  type?: string;
  text?: string;
  transcript?: string;
  error?: string;
};

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function errorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone or speech access was not allowed.";
    case "no-speech":
      return "I didn't hear anything. Try again when you're ready.";
    case "audio-capture":
      return "No microphone was available.";
    default:
      return "Voice input stopped. You can type instead.";
  }
}

function voiceSocketUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_VOICE_WS_URL?.trim();
  return value || null;
}

function serverEvent(value: string): VoiceServerEvent | null {
  try {
    const event = JSON.parse(value) as VoiceServerEvent;
    return event && typeof event === "object" ? event : null;
  } catch {
    return null;
  }
}

export function useVoiceInput(onTranscript?: (text: string) => void) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ExplicitVoiceMode>("browser");
  const supported = useSyncExternalStore(
    () => () => {},
    () => getRecognitionConstructor() !== null,
    () => false,
  );

  const cleanupExplicit = useCallback(() => {
    workletRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    socketRef.current?.close();
    audioContextRef.current?.close().catch(() => {});
    workletRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    socketRef.current = null;
    audioContextRef.current = null;
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    cleanupExplicit();
    setListening(false);
  }, [cleanupExplicit]);

  const startExplicit = useCallback(async (url: string) => {
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioWorkletNode === "undefined") {
      throw new Error("This browser cannot stream microphone audio.");
    }

    const sessionResponse = await fetch("/api/voice/session", {
      cache: "no-store",
    });
    if (!sessionResponse.ok) {
      throw new Error("Voice gateway is not configured.");
    }
    const session = (await sessionResponse.json()) as {
      ws_url?: string;
      ticket?: string;
    };
    const socketUrl = session.ws_url || url;
    const socketTarget = new URL(socketUrl, window.location.href);
    if (session.ticket) socketTarget.searchParams.set("ticket", session.ticket);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    const context = new AudioContext();
    await context.audioWorklet.addModule("/pcm-worklet.js");
    const socket = new WebSocket(socketTarget.toString());
    socket.binaryType = "arraybuffer";

    const source = context.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(context, "famile-pcm16-processor");
    source.connect(worklet);
    // The processor only needs to run; its output is sent through the port,
    // not to speakers. Connecting to a zero-gain node keeps the graph alive.
    const silent = context.createGain();
    silent.gain.value = 0;
    worklet.connect(silent);
    silent.connect(context.destination);

    streamRef.current = stream;
    audioContextRef.current = context;
    sourceRef.current = source;
    workletRef.current = worklet;
    socketRef.current = socket;
    setMode("websocket");

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "start",
        encoding: "pcm_s16le",
        sample_rate: 16000,
        channels: 1,
      }));
      setListening(true);
    };
    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const message = serverEvent(event.data);
      if (!message) return;
      if (message.type === "error" || message.error) {
        setError(message.error ?? "Voice transcription stopped.");
        stop();
        return;
      }
      const next = message.text ?? message.transcript;
      if (message.type === "transcript" && next) {
        setTranscript(next);
        onTranscript?.(next);
      }
    };
    socket.onerror = () => {
      setError("The voice connection could not be opened. You can type instead.");
      stop();
    };
    socket.onclose = () => {
      cleanupExplicit();
      setListening(false);
    };
    worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(event.data);
    };
    await context.resume();
  }, [cleanupExplicit, onTranscript, stop]);

  const start = useCallback(() => {
    const Constructor = getRecognitionConstructor();
    const socketUrl = voiceSocketUrl();
    if (listening) return;

    if (socketUrl) {
      setTranscript("");
      setError(null);
      startExplicit(socketUrl).catch((reason: unknown) => {
        cleanupExplicit();
        setError(reason instanceof Error ? reason.message : "Voice input could not start.");
        setListening(false);
      });
      return;
    }
    if (!Constructor) return;

    const recognition = new Constructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = document.documentElement.lang || "en-US";
    recognitionRef.current = recognition;
    setTranscript("");
    setError(null);

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let next = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.length > 0) next += result[0].transcript;
      }
      setTranscript(next);
      onTranscript?.(next);
    };
    recognition.onerror = (event) => {
      setError(errorMessage(event.error));
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setError("Voice input is already starting. Try again in a moment.");
      setListening(false);
    }
  }, [cleanupExplicit, listening, onTranscript, startExplicit]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      cleanupExplicit();
    };
  }, [cleanupExplicit]);

  return {
    supported: supported || voiceSocketUrl() !== null,
    listening,
    transcript,
    error,
    mode,
    start,
    stop,
  };
}
