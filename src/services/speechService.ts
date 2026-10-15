export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onResult: (transcript: string) => void;
  onError?: (errorMessage: string, isPermissionError?: boolean) => void;
  onEnd?: () => void;
}

export interface SpeechListenOptions {
  continuous?: boolean;
}

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.isSupported = true;
        this.initRecognition(false);
      } else {
        this.isSupported = false;
      }
    }
  }

  private initRecognition(continuous: boolean) {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  public checkSupport(): { supported: boolean; reason?: string } {
    if (this.isSupported) {
      return { supported: true };
    }
    return {
      supported: false,
      reason: 'Browser Web Speech API is not supported in this browser (Chrome, Edge, or Safari recommended). You can use the fallback text command input.'
    };
  }

  /**
   * Explicitly request microphone stream and setup real-time audio analyzer for visual feedback
   */
  public async requestMicrophoneStream(): Promise<{ success: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { success: false, error: 'Media devices API not available in this browser.' };
    }

    try {
      // Release existing if any
      this.releaseMicrophoneStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      this.audioStream = stream;

      // Initialize Web Audio API Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.5;
        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }

      return { success: true };
    } catch (err: any) {
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const msg = isDenied 
        ? 'Microphone permission was denied. Please allow microphone access in browser settings.'
        : `Microphone access error: ${err.message || 'Device unavailable'}`;
      return { success: false, error: msg };
    }
  }

  /**
   * Release microphone stream hardware completely to ensure privacy when listening is disabled
   */
  public releaseMicrophoneStream(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      this.audioStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
  }

  /**
   * Calculate live normalized volume level (0-100) from active microphone stream
   */
  public getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) {
      return 0;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    // Normalize to 0-100
    return Math.min(100, Math.round((avg / 255) * 160));
  }

  public isStreamActive(): boolean {
    return !!this.audioStream && this.audioStream.active;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public startListening(
    callbacks: SpeechRecognitionCallbacks,
    options: SpeechListenOptions = { continuous: false }
  ): void {
    if (!this.isSupported) {
      callbacks.onError?.('Web Speech API is not supported in this browser.', false);
      return;
    }

    // Re-create recognition instance with desired continuous mode
    this.initRecognition(!!options.continuous);

    if (!this.recognition) {
      callbacks.onError?.('Speech recognition could not be initialized.', false);
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
        errorMsg = 'Microphone access denied. Please grant permission in browser settings.';
        isPermission = true;
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Waiting for Sofia...';
      } else if (event.error === 'network') {
        errorMsg = 'Speech network error occurred.';
      } else if (event.error === 'aborted') {
        // Aborted intentionally when stopping/switching
        return;
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

  public abortListening(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public speak(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore audio synthesis error
      }
    }
  }
}

export const speechService = new SpeechService();
