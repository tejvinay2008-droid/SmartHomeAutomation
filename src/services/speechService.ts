export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onResult: (transcript: string) => void;
  onError?: (errorMessage: string, isPermissionError?: boolean) => void;
  onEnd?: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
      } else {
        this.isSupported = false;
      }
    }
  }

  public checkSupport(): { supported: boolean; reason?: string } {
    if (this.isSupported) {
      return { supported: true };
    }
    return {
      supported: false,
      reason: 'Browser Web Speech API is not supported in this environment (requires Chrome, Edge, or Safari). You can use the fallback text command input below.'
    };
  }

  public startListening(callbacks: SpeechRecognitionCallbacks): void {
    if (!this.isSupported || !this.recognition) {
      callbacks.onError?.('Web Speech API is not supported in this browser.', false);
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim) {
        callbacks.onInterim?.(interim);
      }
      if (final) {
        callbacks.onResult(final.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let errorMsg = 'Voice recognition error';
      let isPermission = false;

      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        errorMsg = 'Microphone access denied. Please grant permission in browser settings or use the fallback text bar.';
        isPermission = true;
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Please try speaking again.';
      } else if (event.error === 'network') {
        errorMsg = 'Speech network error occurred.';
      } else {
        errorMsg = `Speech error: ${event.error}`;
      }

      callbacks.onError?.(errorMsg, isPermission);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      callbacks.onError?.(`Could not start speech recognition: ${err.message || 'Busy'}`, false);
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public speak(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const speechService = new SpeechService();
