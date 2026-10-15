import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Radio, 
  Send, 
  Sparkles, 
  Volume2, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck
} from 'lucide-react';
import { useSofiaVoice } from '../context/SofiaVoiceContext';
import { useTheme } from '../context/ThemeContext';

const QUICK_COMMANDS = [
  { label: 'Turn on bedroom light', command: 'Sofia, turn on the bedroom light' },
  { label: 'Turn off all lights', command: 'Hey Sofia, turn off all lights' },
  { label: 'Set living room AC to 22°', command: 'Sofia, set the living room AC to 22 degrees' },
  { label: 'Turn on kitchen fan', command: 'Sofia, turn on the kitchen fan' },
  { label: 'Close bedroom curtains', command: 'Sofia, close the bedroom curtains' },
  { label: '❌ Test Without Sofia', command: 'Turn on the bedroom light', isNegative: true },
];

export const SofiaVoicePanel: React.FC = () => {
  const { theme } = useTheme();
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
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      executeTextCommand(textInput.trim());
      setTextInput('');
    }
  };

  const handleOrbClick = () => {
    if (isHandsFree) {
      toggleHandsFree(false);
    } else {
      startClickToTalk();
    }
  };

  // State presentation helper
  const getStatusBadge = () => {
    switch (voiceState) {
      case 'WAITING_FOR_WAKE_WORD':
        return {
          label: 'Waiting for Wake Word ("Sofia" / "Hey Sofia")',
          dotClass: 'bg-purple-400 animate-pulse',
          bgClass: 'bg-purple-500/10 border-purple-500/25 text-purple-300',
        };
      case 'WAKE_WORD_DETECTED':
        return {
          label: "Yes? I'm listening...",
          dotClass: 'bg-pink-500 animate-ping',
          bgClass: 'bg-pink-500/15 border-pink-500/35 text-pink-300',
        };
      case 'PROCESSING':
        return {
          label: 'Processing command with SOFIA NLP...',
          dotClass: 'bg-amber-400 animate-spin',
          bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        };
      case 'SUCCESS':
        return {
          label: 'Command Executed Successfully',
          dotClass: 'bg-emerald-400',
          bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        };
      case 'ERROR':
        return {
          label: 'Notice • Start with Sofia',
          dotClass: 'bg-rose-400',
          bgClass: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
        };
      case 'DISABLED':
      default:
        return {
          label: 'Hands-Free Off • Click Mic or Toggle to Enable',
          dotClass: 'bg-gray-400',
          bgClass: 'bg-white/[0.04] border-white/10 text-gray-300',
        };
    }
  };

  const badge = getStatusBadge();
  const isListeningActive = isMicActive || voiceState === 'WAITING_FOR_WAKE_WORD' || voiceState === 'WAKE_WORD_DETECTED';

  return (
    <section 
      aria-labelledby="sofia-panel-heading"
      className={`relative overflow-hidden rounded-[32px] p-6 lg:p-7 border transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-[#141520] to-[#0f1017] border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(168,85,247,0.12)]'
          : 'bg-white border-purple-200 shadow-xl shadow-purple-500/5 text-slate-800'
      }`}
    >
      {/* Ambient background glow accents */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Top Header: Title, Subtitle, and Hands-Free Toggle */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] dark:border-white/[0.06] border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md shadow-pink-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 id="sofia-panel-heading" className="text-xl md:text-2xl font-semibold tracking-tight dark:text-white text-slate-900">
              Talk to SOFIA
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-purple-500/15 border border-purple-500/30 text-purple-300">
              Primary Voice Assistant
            </span>
          </div>
          <p className="mt-1 text-sm dark:text-gray-400 text-slate-600">
            Say <span className="font-semibold text-pink-400 dark:text-pink-300">"Sofia"</span> or <span className="font-semibold text-purple-400 dark:text-purple-300">"Hey Sofia"</span> followed by your command.
          </p>
        </div>

        {/* Controls: Hands-Free Switch & Click-to-Talk Fallback */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Hands-Free Toggle Switch */}
          <div className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl border transition ${
            theme === 'dark' 
              ? 'bg-[#181924] border-white/10' 
              : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold dark:text-gray-200 text-slate-800 flex items-center gap-1.5 justify-end">
                <Radio className={`w-3.5 h-3.5 ${isHandsFree ? 'text-pink-400 animate-pulse' : 'text-gray-400'}`} />
                <span>Hands-Free Mode</span>
              </span>
              <span className="text-[10px] dark:text-gray-400 text-slate-500">
                {isHandsFree ? 'Always Listening for "Sofia"' : 'Listening Disabled'}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isHandsFree}
              onClick={() => toggleHandsFree(!isHandsFree)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isHandsFree ? 'bg-gradient-to-r from-purple-600 to-pink-500' : 'bg-gray-600/40 dark:bg-gray-700'
              }`}
              title={isHandsFree ? 'Disable hands-free listening' : 'Enable hands-free listening for Sofia'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isHandsFree ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Click-to-Talk Fallback Button */}
          <button
            type="button"
            onClick={startClickToTalk}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-medium transition flex items-center gap-2 cursor-pointer active:scale-95 ${
              voiceState === 'WAKE_WORD_DETECTED' && !isHandsFree
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-300 shadow-md shadow-pink-500/20'
                : theme === 'dark'
                ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-gray-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title="Click to talk fallback: Record one command starting with Sofia"
          >
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>Click-to-Talk Fallback</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Centerpiece: Animated SOFIA Orb & Listening Status */}
      <div className="relative z-10 py-6 flex flex-col md:flex-row items-center gap-6">
        {/* Animated SOFIA Orb / Mic Button */}
        <div className="relative shrink-0 flex items-center justify-center">
          {/* Pulsing Ripple Rings when listening */}
          {isListeningActive && (
            <>
              <div className="absolute w-36 h-36 rounded-full border border-pink-500/20 animate-ripple" />
              <div 
                className="absolute w-48 h-48 rounded-full border border-purple-500/15 animate-ripple" 
                style={{ animationDelay: '0.6s' }} 
              />
            </>
          )}

          {/* Interactive Assistant Orb Button */}
          <button
            type="button"
            onClick={handleOrbClick}
            aria-label={
              isHandsFree 
                ? 'Hands-free active. Click to disable' 
                : 'Click to start voice command with Sofia'
            }
            className="group relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full transition-transform active:scale-95 focus:outline-none cursor-pointer"
          >
            <div 
              className={`w-full h-full rounded-full transition-all duration-500 group-hover:scale-105 flex items-center justify-center ${
                isListeningActive
                  ? 'animate-orb shadow-[0_0_50px_rgba(236,72,153,0.7),0_0_80px_rgba(168,85,247,0.4)]'
                  : 'shadow-[0_0_25px_rgba(168,85,247,0.25)] opacity-85 group-hover:opacity-100'
              }`}
              style={{
                background: 'radial-gradient(circle at 35% 30%, #f9a8d4 0%, #f43f5e 35%, #ec4899 60%, #8b5cf6 85%, #6366f1 100%)',
              }}
            >
              {isMicActive ? (
                <Mic className="w-9 h-9 text-white drop-shadow-md animate-pulse" />
              ) : (
                <MicOff className="w-8 h-8 text-white/80 group-hover:text-white" />
              )}
            </div>
          </button>
        </div>

        {/* Status, Waves, Live Transcription, and Command Result */}
        <div className="flex-1 w-full space-y-3 text-center md:text-left">
          {/* Status Badge + Audio Waveform */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition ${badge.bgClass}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dotClass}`} />
              <span>{badge.label}</span>
            </div>

            {/* Live Audio Waves when mic is capturing */}
            {isMicActive && (
              <div className="inline-flex items-center gap-1 h-5 px-2 py-0.5 rounded-full bg-black/20 border border-white/5">
                {soundWaves.map((height, idx) => (
                  <span
                    key={idx}
                    className="w-1 rounded-full bg-gradient-to-t from-purple-500 to-pink-400 transition-all duration-75"
                    style={{ height: `${Math.max(20, height)}%` }}
                  />
                ))}
              </div>
            )}

            {/* Microphone Hardware Status Indicator */}
            <div className="text-[11px] dark:text-gray-400 text-slate-500 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isMicActive ? 'bg-pink-400' : 'bg-gray-500'}`} />
              <span>{isMicActive ? 'Microphone Hardware Active' : 'Microphone Hardware Inactive'}</span>
            </div>
          </div>

          {/* Live Transcription Speech Bubble */}
          <div className="p-3 rounded-2xl dark:bg-[#181924]/80 bg-slate-100 border dark:border-white/[0.08] border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider dark:text-purple-300 text-purple-700 block mb-1">
              Live Transcription
            </span>
            <div className="text-sm dark:text-gray-200 text-slate-800 font-medium min-h-[22px] flex items-center justify-center md:justify-start">
              {interimTranscript ? (
                <span className="text-pink-400 italic">"{interimTranscript}..."</span>
              ) : recognizedText ? (
                <span>"{recognizedText}"</span>
              ) : (
                <span className="dark:text-gray-500 text-slate-400 font-normal">
                  {isHandsFree 
                    ? 'Say "Sofia, turn on the bedroom light" or "Hey Sofia, turn off all lights"...'
                    : 'Click microphone or toggle hands-free mode to speak...'}
                </span>
              )}
            </div>
          </div>

          {/* Command Result Area */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 truncate">
              {voiceState === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : voiceState === 'ERROR' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
              )}
              <span className="dark:text-gray-300 text-slate-700 font-medium truncate">
                {commandResult}
              </span>
            </div>

            {lastParsedResult?.targetRoom && lastParsedResult.targetRoom !== 'all' && (
              <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-500/15 border border-purple-500/25 text-purple-300 capitalize">
                Room: {lastParsedResult.targetRoom.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error / Alert notice if wake word is missing or mic error */}
      {errorMessage && (
        <div className="relative z-10 mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold">Notice: </strong>
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

      {/* Text Command Input: Enforces Sofia Rule */}
      <div className="relative z-10 pt-2 pb-1">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type command starting with Sofia (e.g. 'Sofia, turn on the bedroom light')"
              className={`w-full py-2.5 pl-4 pr-11 text-xs rounded-2xl border transition focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                theme === 'dark'
                  ? 'bg-[#181924] border-white/10 text-white placeholder-gray-500 focus:border-purple-500'
                  : 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-purple-500'
              }`}
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 transition cursor-pointer"
              aria-label="Submit command to SOFIA"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Quick Demo Commands Chips */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.06] dark:border-white/[0.06] border-slate-200">
        <div className="flex items-center justify-between text-[11px] mb-2 dark:text-gray-400 text-slate-500">
          <span className="font-medium">QUICK VOICE COMMANDS:</span>
          <span className="text-purple-400 text-[10px]">Click any chip to run</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_COMMANDS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => executeTextCommand(item.command)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer text-left active:scale-95 ${
                item.isNegative
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/25 text-rose-300'
                  : theme === 'dark'
                  ? 'bg-white/[0.04] hover:bg-purple-500/20 hover:border-purple-500/35 border-white/[0.08] text-gray-200 hover:text-purple-200'
                  : 'bg-slate-100 hover:bg-purple-50 hover:border-purple-300 border-slate-200 text-slate-700'
              }`}
            >
              <span>{item.command}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Accordions: Academic Pipeline Inspector & Privacy Information */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* NLP Pipeline Drawer Toggle */}
        <button
          type="button"
          onClick={() => setShowPipeline(!showPipeline)}
          className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-medium transition cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5 text-pink-400" />
          <span>Academic NLP Pipeline Audit (8 Stages)</span>
          {showPipeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Privacy & Permissions Policy Link */}
        <button
          type="button"
          onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
          className="flex items-center gap-1.5 dark:text-gray-400 text-slate-500 hover:text-purple-400 transition cursor-pointer text-[11px]"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Microphone Privacy & Browser Lifecycle</span>
          {showPrivacyInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Collapsible NLP Pipeline Audit Panel */}
      {showPipeline && lastParsedResult && (
        <div className="relative z-10 mt-3 p-4 rounded-2xl bg-black/40 border border-white/[0.08] text-left max-h-72 overflow-y-auto text-xs space-y-2.5 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-semibold text-gray-200">Execution Pipeline Audit Trail</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                lastParsedResult.wakeWordDetected
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
              }`}>
                Wake Word: {lastParsedResult.wakeWordDetected ? 'VERIFIED' : 'FAILED'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Confidence: {Math.round(lastParsedResult.confidence * 100)}%
              </span>
            </div>
          </div>

          {lastParsedResult.pipelineStages.map((stage) => (
            <div key={stage.step} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                <span className="text-purple-300 flex items-center gap-2">
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
              <div className="font-mono text-[10px] bg-black/60 p-1.5 rounded border border-white/[0.05] text-gray-300 break-all">
                <strong className="text-gray-500">Output: </strong>
                {typeof stage.output === 'object' ? JSON.stringify(stage.output) : String(stage.output)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible Privacy & Permission Architecture Disclosure */}
      {showPrivacyInfo && (
        <div className="relative z-10 mt-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 text-left text-xs space-y-2 dark:text-emerald-200 text-emerald-900 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Microphone Privacy & Engine Architecture</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] dark:text-gray-300 text-slate-600">
            <li>
              <strong>100% In-Browser Processing:</strong> Voice audio is analyzed entirely inside your browser using the Web Audio API and SpeechRecognition interface. Raw audio is never stored, recorded, or uploaded to external cloud servers.
            </li>
            <li>
              <strong>Hardware Release:</strong> When hands-free mode is turned OFF, microphone tracks (<code className="text-pink-400">MediaStreamTrack.stop()</code>) are immediately terminated and hardware access is closed.
            </li>
            <li>
              <strong>Background Tab Suspension:</strong> Browsers intentionally suspend background-tab microphone access when switching tabs or minimizing the window to protect your privacy and battery life.
            </li>
            <li>
              <strong>Dual-Engine Fallback:</strong> When hands-free wake-word detection is unavailable, the "Click-to-Talk Fallback" button allows one-touch execution while still enforcing the mandatory "Sofia" wake-word addressing check.
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};
