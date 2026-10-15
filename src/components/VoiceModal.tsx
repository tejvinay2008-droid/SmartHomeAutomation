import React, { useState, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  AlertCircle,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { useSofiaVoice } from '../context/SofiaVoiceContext';
import type { ParsedCommandResult } from '../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (commandText: string) => ParsedCommandResult;
  lastParsedResult?: ParsedCommandResult | null;
}

const SAMPLE_COMMANDS = [
  "Sofia, turn on the bedroom light",
  "Hey Sofia, turn off all lights",
  "Sofia, set the living room AC to 22 degrees",
  "Sofia, turn on the kitchen fan",
  "Sofia, close the bedroom curtains",
  "Sofia, turn on the bedroom bedside lamp",
  "Sofia, turn off the bedroom ceiling light",
  "Sofia, turn on the kitchen counter lights",
  "Sofia, turn off all bedroom lights",
  "Sofia, turn off all kitchen appliances",
  "Sofia, open the bedroom curtains",
  "Sofia, unlock front door",
];

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    voiceState,
    isHandsFree,
    isMicActive,
    interimTranscript,
    recognizedText,
    commandResult,
    lastParsedResult,
    errorMessage,
    soundWaves,
    toggleHandsFree,
    startClickToTalk,
    executeTextCommand,
    clearError,
  } = useSofiaVoice();

  const [textInput, setTextInput] = useState('');
  const [showPipeline, setShowPipeline] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleOrbClick = () => {
    if (isHandsFree) {
      toggleHandsFree(false);
    } else {
      startClickToTalk();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      executeTextCommand(textInput.trim());
      setTextInput('');
    }
  };

  const isListeningActive = isMicActive || voiceState === 'WAITING_FOR_WAKE_WORD' || voiceState === 'WAKE_WORD_DETECTED';

  const getStatusText = () => {
    switch (voiceState) {
      case 'WAITING_FOR_WAKE_WORD':
        return 'Waiting for "Sofia" or "Hey Sofia"...';
      case 'WAKE_WORD_DETECTED':
        return "Yes? I'm listening...";
      case 'PROCESSING':
        return 'Processing command with SOFIA NLP...';
      case 'SUCCESS':
        return 'Command Executed';
      case 'ERROR':
        return 'Notice • Start with Sofia';
      case 'DISABLED':
      default:
        return 'Sofia Voice Assistant Ready';
    }
  };

  const currentResult = lastParsedResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="relative w-full max-w-[520px] bg-[#12131c] border border-white/[0.12] rounded-[32px] p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center text-center overflow-hidden"
      >
        {/* Close Button top-left */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          aria-label="Close voice assistant modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hands-free mode status toggle button top-right */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleHandsFree(!isHandsFree)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
              isHandsFree
                ? 'bg-pink-500/15 border-pink-500/35 text-pink-300'
                : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isHandsFree ? 'text-pink-400 animate-pulse' : 'text-gray-400'}`} />
            <span>{isHandsFree ? 'Hands-Free ON' : 'Hands-Free OFF'}</span>
          </button>
        </div>

        {/* Status / Listening Badge */}
        <div className="mb-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-gray-300">
            <span className={`w-2 h-2 rounded-full ${
              voiceState === 'WAKE_WORD_DETECTED'
                ? 'bg-pink-500 animate-ping'
                : voiceState === 'WAITING_FOR_WAKE_WORD'
                ? 'bg-purple-400 animate-pulse'
                : voiceState === 'SUCCESS'
                ? 'bg-emerald-400'
                : 'bg-gray-400'
            }`} />
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Centerpiece: Pink-Purple Glowing Orb */}
        <div className="relative my-6 flex items-center justify-center">
          {/* Outer Pulsing Wave Rings */}
          {isListeningActive && (
            <>
              <div className="absolute w-44 h-44 rounded-full border border-pink-500/20 animate-ripple" />
              <div className="absolute w-56 h-56 rounded-full border border-purple-500/15 animate-ripple" style={{ animationDelay: '0.7s' }} />
            </>
          )}

          {/* Interactive Glowing Orb */}
          <button
            onClick={handleOrbClick}
            aria-label={isListeningActive ? "Click to stop listening" : "Click to speak with Sofia"}
            className="group relative z-10 w-28 h-28 rounded-full transition-transform active:scale-95 focus:outline-none cursor-pointer"
          >
            <div 
              className={`w-full h-full rounded-full transition-all duration-500 group-hover:scale-105 flex items-center justify-center ${
                isListeningActive
                  ? 'animate-orb shadow-[0_0_60px_rgba(236,72,153,0.7),0_0_90px_rgba(168,85,247,0.45)]'
                  : 'shadow-[0_0_30px_rgba(168,85,247,0.3)] opacity-90 group-hover:opacity-100'
              }`}
              style={{
                background: 'radial-gradient(circle at 35% 30%, #f9a8d4 0%, #f43f5e 35%, #ec4899 60%, #8b5cf6 85%, #6366f1 100%)',
              }}
            >
              {isMicActive ? (
                <Mic className="w-10 h-10 text-white drop-shadow-md animate-pulse" />
              ) : (
                <MicOff className="w-9 h-9 text-white/80 group-hover:text-white" />
              )}
            </div>
          </button>
        </div>

        {/* Visual Audio Wave Bars when mic is active */}
        {isMicActive && (
          <div className="flex items-center gap-1.5 h-6 mb-2">
            {soundWaves.map((h, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(20, h)}%` }}
              />
            ))}
          </div>
        )}

        {/* Recognized Command Speech Bubble */}
        <div className="mt-1 mb-2 max-w-[90%]">
          <div className="inline-block px-5 py-2.5 rounded-2xl bg-[#1b1c26] border border-white/[0.08] text-sm text-gray-200 font-normal tracking-wide shadow-inner">
            {interimTranscript ? (
              <span className="text-pink-400 italic">"{interimTranscript}..."</span>
            ) : (
              <span>{recognizedText ? `"${recognizedText}"` : 'Say "Sofia, turn on the bedroom light"...'}</span>
            )}
          </div>
        </div>

        {/* Execution Result */}
        <div className="min-h-[28px] mb-3 flex items-center justify-center gap-1.5 text-sm text-gray-300">
          {voiceState === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {voiceState === 'ERROR' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{commandResult}</span>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-left flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-snug">
              <span>{errorMessage}</span>
            </div>
            <button 
              type="button" 
              onClick={clearError}
              className="text-rose-400 hover:text-rose-200 text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Fallback Text Input (Enforces Sofia) */}
        <form onSubmit={handleFormSubmit} className="w-full flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type command (e.g. 'Sofia, turn on the bedroom fan')"
              className="w-full bg-[#181a24] border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:hover:bg-purple-600 transition cursor-pointer"
              aria-label="Submit command to SOFIA"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOrbClick}
            className={`p-2.5 rounded-full border transition cursor-pointer ${
              isMicActive
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/[0.05] border-white/10 text-gray-300 hover:text-white'
            }`}
            aria-label={isMicActive ? "Stop listening" : "Start speaking with Sofia"}
          >
            {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
                onClick={() => executeTextCommand(cmd)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 hover:border-purple-500/30 border border-white/[0.06] text-[11px] text-gray-300 hover:text-purple-200 transition text-left truncate max-w-full cursor-pointer"
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
            className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-pink-400" />
              <span>Academic NLP Pipeline Inspector (8 Stages)</span>
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
