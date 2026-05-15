export function cancelSpeech(): void {
  if (typeof window === "undefined") return;

  window.speechSynthesis.cancel();
}

export function speakText(text: string): void {
  if (typeof window === "undefined") return;

  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-US";

  utterance.rate = 1;

  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}