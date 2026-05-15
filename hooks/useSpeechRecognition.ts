"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal typing; DOM lib does not expose vendor-prefixed constructors on `Window`. */
interface WebSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult:
    | ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void)
    | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => WebSpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");

  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognitionRef.current = recognition;

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let currentTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }

      setTranscript(currentTranscript);
    };

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    return () => {
      try {
        recognition.stop();
      } catch {
        /* not running */
      }
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    clearTranscript,
  };
};
