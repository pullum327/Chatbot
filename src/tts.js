// src/tts.js
let isSpeaking = false;
let utterance = null;

export const speak = (text, onStart = () => {}, onEnd = () => {}) => {
  if (!text) return;

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    return;
  }

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    isSpeaking = true;
    onStart();
  };
  utterance.onend = () => {
    isSpeaking = false;
    onEnd();
  };
  utterance.onerror = () => {
    isSpeaking = false;
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
  }
};

export const isTTSPlaying = () => isSpeaking;
