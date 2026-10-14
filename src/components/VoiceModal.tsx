import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  AlertCircle 
} from 'lucide-react';
import { speechService } from '../services/speechService';
import type { ParsedCommandResult } from '../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (commandText: string) => ParsedCommandResult;
  lastParsedResult?: ParsedCommandResult | null;
}

const SAMPLE_COMMANDS = [
  "Turn on the bedroom bedside lamp",
  "Turn off the bedroom ceiling light",
  "Turn on the bedroom fan",
  "Set the bedroom AC to 22 degrees",
  "Open the bedroom curtains",
  "Turn on the kitchen lights",
  "Turn on the kitchen exhaust fan",
  "Turn off the kitchen cooktop",
  "Turn on the kitchen counter lights",
  "Turn off all bedroom lights",
  "Turn off all kitchen appliances",
  "Turn on the living room light",
  "Open window shades",
  "Unlock front door",
];

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
  lastParsedResult,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recognizedText, setRecognizedText] = useState('Turn on the living room light');
  const [executionResult, setExecutionResult] = useState('Living room lights turned on.');
  const [textInput, setTextInput] = useState('');
  const [showPipeline, setShowPipeline] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundWaves, setSoundWaves] = useState([35, 60, 45, 80, 50, 70, 40]);

  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Support Check
  useEffect(() => {
    if (isOpen) {
      const support = speechService.checkSupport();
      if (!support.supported) {
        setErrorMessage(support.reason || 'Web Speech API unavailable in this browser. Please use text input or quick chips.');
      } else {
        setErrorMessage(null);
        startListening();
      }
    } else {
      stopListening();
    }
  }, [isOpen]);

  // Audio wave animation simulator when listening
  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setSoundWaves([
        Math.floor(25 + Math.random() * 65),
        Math.floor(35 + Math.random() * 60),
        Math.floor(45 + Math.random() * 55),
        Math.floor(30 + Math.random() * 70),
        Math.floor(40 + Math.random() * 60),
        Math.floor(20 + Math.random() * 75),
        Math.floor(30 + Math.random() * 60),
      ]);
    }, 120);
    return () => clearInterval(interval);
  }, [isListening]);

  const startListening = () => {
    setErrorMessage(null);
    setInterimText('');
    speechService.startListening({
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (text) => {
        setInterimText(text);
      },
      onResult: (finalTranscript) => {
        setIsListening(false);
        handleProcessCommand(finalTranscript);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleProcessCommand = (command: string) => {
    if (!command.trim()) return;
    setRecognizedText(command);
    const result = onExecuteCommand(command);
    setExecutionResult(result.feedbackMessage);
    
    // Spoken voice feedback
    speechService.speak(result.feedbackMessage);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleProcessCommand(textInput);
      setTextInput('');
    }
  };

  if (!isOpen) return null;

  const currentResult = lastParsedResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="relative w-full max-w-[500px] bg-[#12131a] border border-white/[0.12] rounded-[32px] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center text-center overflow-hidden"
      >
        {/* Close Button top-left matching reference image */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
          aria-label="Close voice assistant"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status / Listening Badge */}
        <div className="mb-4 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-gray-300">
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-pink-500 animate-ping' : 'bg-purple-400'}`} />
            <span>{isListening ? 'Listening for voice command...' : 'Voice Assistant Ready'}</span>
          </div>
        </div>

        {/* Centerpiece: Pink-Purple Glowing Orb matching reference image */}
        <div className="relative my-6 flex items-center justify-center">
          {/* Outer Pulsing Wave Rings */}
          {isListening && (
            <>
              <div className="absolute w-44 h-44 rounded-full border border-pink-500/20 animate-ripple" />
              <div className="absolute w-56 h-56 rounded-full border border-purple-500/15 animate-ripple" style={{ animationDelay: '0.7s' }} />
            </>
          )}

          {/* Interactive Glowing Orb */}
          <button
            onClick={toggleListening}
            aria-label={isListening ? "Click to pause listening" : "Click to speak"}
            className="group relative z-10 w-28 h-28 rounded-full transition-transform active:scale-95 focus:outline-none cursor-pointer"
          >
            <div 
              className="w-full h-full rounded-full animate-orb shadow-[0_0_60px_rgba(236,72,153,0.7),0_0_90px_rgba(168,85,247,0.45)] transition-all duration-500 group-hover:scale-105"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #f9a8d4 0%, #f43f5e 35%, #ec4899 60%, #8b5cf6 85%, #6366f1 100%)',
              }}
            />
          </button>
        </div>

        {/* Visual Audio Wave Bars when listening */}
        {isListening && (
          <div className="flex items-center gap-1.5 h-6 mb-2">
            {soundWaves.map((h, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full transition-all duration-100"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}

        {/* Recognized Command Speech Bubble */}
        <div className="mt-2 mb-3 max-w-[90%]">
          <div className="inline-block px-5 py-2.5 rounded-2xl bg-[#1b1c26] border border-white/[0.08] text-sm text-gray-200 font-normal tracking-wide shadow-inner">
            {isListening && interimText ? (
              <span className="text-gray-400 italic">"{interimText}..."</span>
            ) : (
              <span>{recognizedText ? `"${recognizedText}"` : 'Say a command...'}</span>
            )}
          </div>
        </div>

        {/* Execution Result */}
        <div className="min-h-[28px] mb-4">
          <p className="text-sm font-light text-gray-300">
            {executionResult}
          </p>
        </div>

        {/* Error notification if speech unavailable */}
        {errorMessage && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="flex-1 leading-snug">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Fallback Text Input */}
        <form onSubmit={handleFormSubmit} className="w-full flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type command (e.g. 'Turn on the bedroom fan')"
              className="w-full bg-[#181a24] border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:hover:bg-purple-600 transition"
              aria-label="Submit command"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-full border transition ${
              isListening
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/[0.05] border-white/10 text-gray-300 hover:text-white'
            }`}
            aria-label={isListening ? "Stop listening" : "Start speech recognition"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </form>

        {/* Sample Command Quick Chips */}
        <div className="w-full text-left mb-3">
          <p className="text-[11px] font-medium text-gray-500 mb-1.5 flex items-center justify-between">
            <span>QUICK DEMO COMMANDS:</span>
            <span className="text-[10px] text-purple-400">Click to run</span>
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {SAMPLE_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleProcessCommand(cmd)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 hover:border-purple-500/30 border border-white/[0.06] text-[11px] text-gray-300 hover:text-purple-200 transition text-left truncate max-w-full"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Academic NLP Pipeline Inspector Drawer */}
        <div className="w-full pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowPipeline(!showPipeline)}
            className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition"
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-pink-400" />
              <span>Academic NLP Pipeline Inspector (7 Stages)</span>
            </span>
            {showPipeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showPipeline && currentResult && (
            <div className="mt-3 p-3 bg-[#0e0f14] border border-white/[0.08] rounded-2xl text-left max-h-60 overflow-y-auto text-xs space-y-2.5 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                <span className="font-semibold text-gray-200">Execution Pipeline Audit</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Confidence: {Math.round(currentResult.confidence * 100)}%
                </span>
              </div>

              {currentResult.pipelineStages.map((stage) => (
                <div key={stage.step} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                    <span className="text-purple-300 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold">
                        {stage.step}
                      </span>
                      {stage.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        stage.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : stage.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-400 mb-1">{stage.description}</p>
                  <div className="font-mono text-[10px] bg-black/40 p-1.5 rounded border border-white/[0.05] text-gray-300 break-all">
                    <strong className="text-gray-500">Output: </strong>
                    {typeof stage.output === 'object' ? JSON.stringify(stage.output) : String(stage.output)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
