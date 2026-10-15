import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { SofiaVoiceState, ParsedCommandResult } from '../types';
import { speechService } from '../services/speechService';
import { hasWakeWord, extractCommandAfterWakeWord } from '../services/commandParser';

interface SofiaVoiceContextType {
  voiceState: SofiaVoiceState;
  isHandsFree: boolean;
  isMicActive: boolean;
  interimTranscript: string;
  recognizedText: string;
  commandResult: string;
  lastParsedResult: ParsedCommandResult | null;
  errorMessage: string | null;
  audioLevel: number;
  soundWaves: number[];
  mode: 'hands-free' | 'click-to-talk';
  toggleHandsFree: (enable?: boolean) => Promise<void>;
  startClickToTalk: () => Promise<void>;
  stopListening: () => void;
  executeTextCommand: (text: string) => ParsedCommandResult;
  clearError: () => void;
}

const SofiaVoiceContext = createContext<SofiaVoiceContextType | undefined>(undefined);

interface SofiaVoiceProviderProps {
  children: React.ReactNode;
  onExecuteCommand: (commandText: string) => ParsedCommandResult;
}

export const SofiaVoiceProvider: React.FC<SofiaVoiceProviderProps> = ({
  children,
  onExecuteCommand,
}) => {
  const [voiceState, setVoiceState] = useState<SofiaVoiceState>('DISABLED');
  const [isHandsFree, setIsHandsFree] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [commandResult, setCommandResult] = useState<string>('Ready for voice or text command.');
  const [lastParsedResult, setLastParsedResult] = useState<ParsedCommandResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [soundWaves, setSoundWaves] = useState<number[]>([20, 30, 25, 40, 30, 35, 20]);
  const [mode, setMode] = useState<'hands-free' | 'click-to-talk'>('hands-free');

  // Refs for tracking mutable state in speech callbacks
  const isHandsFreeRef = useRef<boolean>(false);
  const voiceStateRef = useRef<SofiaVoiceState>('DISABLED');
  const wakeWordTimeoutRef = useRef<any>(null);
  const awaitingFollowupCommandRef = useRef<boolean>(false);
  const lastProcessedTranscriptRef = useRef<string>('');
  const lastProcessedTimeRef = useRef<number>(0);
  const animFrameRef = useRef<any>(null);
  const onExecuteCommandRef = useRef(onExecuteCommand);

  useEffect(() => {
    onExecuteCommandRef.current = onExecuteCommand;
  }, [onExecuteCommand]);

  // Keep refs in sync with state
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  // Real-time audio waveform / level meter loop
  useEffect(() => {
    let active = true;

    const updateAudioMetering = () => {
      if (!active) return;
      if (isMicActive) {
        const level = speechService.getAudioLevel();
        setAudioLevel(level);

        // Generate dynamic sound wave bars matching actual microphone RMS level
        const base = Math.max(15, level);
        setSoundWaves([
          Math.min(95, Math.floor(base * 0.7 + Math.random() * 20)),
          Math.min(95, Math.floor(base * 0.9 + Math.random() * 25)),
          Math.min(95, Math.floor(base * 1.1 + Math.random() * 20)),
          Math.min(95, Math.floor(base * 1.3 + Math.random() * 30)),
          Math.min(95, Math.floor(base * 1.1 + Math.random() * 25)),
          Math.min(95, Math.floor(base * 0.8 + Math.random() * 20)),
          Math.min(95, Math.floor(base * 0.6 + Math.random() * 15)),
        ]);
      } else {
        setAudioLevel(0);
        setSoundWaves([15, 20, 18, 25, 20, 22, 15]);
      }

      animFrameRef.current = requestAnimationFrame(updateAudioMetering);
    };

    animFrameRef.current = requestAnimationFrame(updateAudioMetering);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isMicActive]);

  // Core execution dispatcher
  const dispatchCommand = useCallback((rawUtterance: string): ParsedCommandResult => {
    setVoiceState('PROCESSING');
    setRecognizedText(rawUtterance);

    const result = onExecuteCommandRef.current(rawUtterance);
    setLastParsedResult(result);
    setCommandResult(result.feedbackMessage);

    if (result.validationSuccess) {
      setVoiceState('SUCCESS');
      speechService.speak(result.feedbackMessage);
    } else {
      setVoiceState('ERROR');
      if (result.feedbackMessage) {
        setErrorMessage(result.feedbackMessage);
        speechService.speak(result.feedbackMessage);
      }
    }

    // Schedule return to waiting or disabled
    setTimeout(() => {
      if (isHandsFreeRef.current) {
        setVoiceState('WAITING_FOR_WAKE_WORD');
        setInterimTranscript('');
      } else {
        setVoiceState('DISABLED');
        speechService.releaseMicrophoneStream();
        setIsMicActive(false);
      }
    }, 3200);

    return result;
  }, []);

  // Internal speech listener starter
  const startSpeechRecognition = useCallback((isContinuous: boolean) => {
    speechService.startListening(
      {
        onStart: () => {
          setIsMicActive(true);
        },
        onInterim: (interim) => {
          setInterimTranscript(interim);

          // Real-time wake-word detection on interim stream
          if (
            voiceStateRef.current === 'WAITING_FOR_WAKE_WORD' &&
            hasWakeWord(interim)
          ) {
            setVoiceState('WAKE_WORD_DETECTED');
            setErrorMessage(null);
          }
        },
        onResult: (finalTranscript) => {
          const now = Date.now();
          const clean = finalTranscript.trim();

          // Deduplicate accidental repeated events within 1.5 seconds
          if (
            clean === lastProcessedTranscriptRef.current &&
            now - lastProcessedTimeRef.current < 1500
          ) {
            return;
          }
          lastProcessedTranscriptRef.current = clean;
          lastProcessedTimeRef.current = now;

          setInterimTranscript('');

          // 1. Two-step scenario: Already waiting for followup command after "Sofia"
          if (awaitingFollowupCommandRef.current) {
            if (wakeWordTimeoutRef.current) {
              clearTimeout(wakeWordTimeoutRef.current);
              wakeWordTimeoutRef.current = null;
            }
            awaitingFollowupCommandRef.current = false;
            // Prepend Sofia to maintain consistent verified pipeline
            dispatchCommand(`Sofia, ${clean}`);
            return;
          }

          // 2. Check wake word
          if (hasWakeWord(clean)) {
            const command = extractCommandAfterWakeWord(clean);

            if (command) {
              // Full command provided in one breath ("Sofia, turn on bedroom light")
              dispatchCommand(clean);
            } else {
              // User said "Sofia" / "Hey Sofia" and stopped: Enter WAKE_WORD_DETECTED and wait for command
              setVoiceState('WAKE_WORD_DETECTED');
              setRecognizedText(clean);
              setCommandResult("Yes? I'm listening...");
              awaitingFollowupCommandRef.current = true;
              speechService.speak("Yes? I'm listening...");

              // 6 second timeout to receive follow-up command
              if (wakeWordTimeoutRef.current) clearTimeout(wakeWordTimeoutRef.current);
              wakeWordTimeoutRef.current = setTimeout(() => {
                awaitingFollowupCommandRef.current = false;
                if (isHandsFreeRef.current) {
                  setVoiceState('WAITING_FOR_WAKE_WORD');
                  setCommandResult('Wake word timed out. Waiting for "Sofia"...');
                } else {
                  setVoiceState('DISABLED');
                  speechService.releaseMicrophoneStream();
                  setIsMicActive(false);
                }
              }, 6000);
            }
          } else {
            // Speech detected WITHOUT wake word!
            if (voiceStateRef.current === 'WAITING_FOR_WAKE_WORD') {
              // In hands-free mode: silently ignore unaddressed speech to avoid false commands
              setInterimTranscript('');
              setCommandResult(`Ignored speech: "${clean.slice(0, 32)}..." (Say "Sofia" to command)`);
            } else {
              // In click-to-talk mode: explicit error message requirement
              setVoiceState('ERROR');
              setRecognizedText(clean);
              setErrorMessage('Start your command with Sofia.');
              setCommandResult('Start your command with Sofia.');
              speechService.speak('Start your command with Sofia.');

              setTimeout(() => {
                if (isHandsFreeRef.current) {
                  setVoiceState('WAITING_FOR_WAKE_WORD');
                } else {
                  setVoiceState('DISABLED');
                  speechService.releaseMicrophoneStream();
                  setIsMicActive(false);
                }
              }, 3000);
            }
          }
        },
        onError: (err, isPermission) => {
          if (isPermission) {
            setVoiceState('ERROR');
            setErrorMessage(err);
            setIsHandsFree(false);
            speechService.releaseMicrophoneStream();
            setIsMicActive(false);
          }
        },
        onEnd: () => {
          // If hands-free is enabled, auto-restart to maintain always-listening wake-word detection
          if (isHandsFreeRef.current && voiceStateRef.current !== 'ERROR') {
            setTimeout(() => {
              if (isHandsFreeRef.current) {
                try {
                  startSpeechRecognition(true);
                } catch {
                  // ignore
                }
              }
            }, 250);
          } else if (!isHandsFreeRef.current) {
            setIsMicActive(false);
            if (voiceStateRef.current === 'WAKE_WORD_DETECTED' && !awaitingFollowupCommandRef.current) {
              setVoiceState('DISABLED');
            }
          }
        },
      },
      { continuous: isContinuous }
    );
  }, [dispatchCommand]);

  // Toggle Hands-Free Mode
  const toggleHandsFree = useCallback(async (enable?: boolean) => {
    const shouldEnable = enable !== undefined ? enable : !isHandsFreeRef.current;

    if (shouldEnable) {
      setErrorMessage(null);
      setMode('hands-free');

      // Request hardware audio stream first
      const micRes = await speechService.requestMicrophoneStream();
      if (!micRes.success) {
        setVoiceState('ERROR');
        setErrorMessage(micRes.error || 'Microphone access denied.');
        setIsHandsFree(false);
        return;
      }

      setIsHandsFree(true);
      isHandsFreeRef.current = true;
      setIsMicActive(true);
      setVoiceState('WAITING_FOR_WAKE_WORD');
      setCommandResult('Listening for "Sofia" or "Hey Sofia"...');

      startSpeechRecognition(true);
    } else {
      // Disabling hands-free: stop recognition and release hardware mic immediately
      setIsHandsFree(false);
      isHandsFreeRef.current = false;
      awaitingFollowupCommandRef.current = false;
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
        wakeWordTimeoutRef.current = null;
      }
      speechService.stopListening();
      speechService.releaseMicrophoneStream();
      setIsMicActive(false);
      setVoiceState('DISABLED');
      setCommandResult('Hands-free listening disabled. Microphone released.');
      setInterimTranscript('');
    }
  }, [startSpeechRecognition]);

  // Click-to-Talk Fallback Mode
  const startClickToTalk = useCallback(async () => {
    if (voiceStateRef.current === 'PROCESSING') return;

    setMode('click-to-talk');
    setErrorMessage(null);
    setInterimTranscript('');

    const micRes = await speechService.requestMicrophoneStream();
    if (!micRes.success) {
      setVoiceState('ERROR');
      setErrorMessage(micRes.error || 'Microphone access denied.');
      return;
    }

    setIsMicActive(true);
    setVoiceState('WAKE_WORD_DETECTED');
    setCommandResult("Listening... Say: 'Sofia' followed by your command.");

    startSpeechRecognition(false);
  }, [startSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
      wakeWordTimeoutRef.current = null;
    }
    awaitingFollowupCommandRef.current = false;
    speechService.stopListening();
    speechService.releaseMicrophoneStream();
    setIsMicActive(false);
    setIsHandsFree(false);
    isHandsFreeRef.current = false;
    setVoiceState('DISABLED');
    setInterimTranscript('');
  }, []);

  // Text Command input
  const executeTextCommand = useCallback((text: string): ParsedCommandResult => {
    return dispatchCommand(text);
  }, [dispatchCommand]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechService.stopListening();
      speechService.releaseMicrophoneStream();
      if (wakeWordTimeoutRef.current) clearTimeout(wakeWordTimeoutRef.current);
    };
  }, []);

  return (
    <SofiaVoiceContext.Provider
      value={{
        voiceState,
        isHandsFree,
        isMicActive,
        interimTranscript,
        recognizedText,
        commandResult,
        lastParsedResult,
        errorMessage,
        audioLevel,
        soundWaves,
        mode,
        toggleHandsFree,
        startClickToTalk,
        stopListening,
        executeTextCommand,
        clearError,
      }}
    >
      {children}
    </SofiaVoiceContext.Provider>
  );
};

export const useSofiaVoice = (): SofiaVoiceContextType => {
  const context = useContext(SofiaVoiceContext);
  if (!context) {
    throw new Error('useSofiaVoice must be used within a SofiaVoiceProvider');
  }
  return context;
};
