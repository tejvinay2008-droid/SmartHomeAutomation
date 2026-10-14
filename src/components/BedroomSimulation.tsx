import React from 'react';
import { 
  Lightbulb, 
  Wind, 
  Minus, 
  Plus, 
  Sparkles,
  Clock
} from 'lucide-react';
import type { Device } from '../types';

interface BedroomSimulationProps {
  devices: Device[];
  onToggleDevice: (id: string) => void;
  onDeviceValueChange?: (id: string, value: number) => void;
  isExpanded?: boolean;
}

export const BedroomSimulation: React.FC<BedroomSimulationProps> = ({
  devices,
  onToggleDevice,
  onDeviceValueChange,
  isExpanded = false,
}) => {
  // Retrieve bedroom appliances
  const ceilingLight = devices.find((d) => d.id === 'bedroom_ceiling_light') || {
    id: 'bedroom_ceiling_light',
    name: 'Bedroom Ceiling',
    isOn: true,
    value: 75,
  };

  const bedsideLamp = devices.find((d) => d.id === 'bedroom_bedside_lamp') || {
    id: 'bedroom_bedside_lamp',
    name: 'Bedside Lamp',
    isOn: true,
    value: 50,
  };

  const fan = devices.find((d) => d.id === 'bedroom_fan') || {
    id: 'bedroom_fan',
    name: 'Bedroom Fan',
    isOn: false,
    value: 2,
  };

  const ac = devices.find((d) => d.id === 'bedroom_ac') || {
    id: 'bedroom_ac',
    name: 'Bedroom AC',
    isOn: true,
    value: 20.5,
  };

  const curtains = devices.find((d) => d.id === 'bedroom_curtains') || {
    id: 'bedroom_curtains',
    name: 'Bedroom Curtains',
    isOn: false,
  };

  // Ambient illumination calculations
  const ceilingVal = ceilingLight.isOn ? (ceilingLight.value ?? 75) : 0;
  const lampVal = bedsideLamp.isOn ? (bedsideLamp.value ?? 50) : 0;
  const lightLevel = ceilingVal * 0.65 + lampVal * 0.35;
  const roomAmbientOpacity = Math.max(0.12, lightLevel / 100);

  const handleAdjustTemp = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = ac.value ?? 20.5;
    const nextTemp = Math.min(30, Math.max(16, Math.round((current + delta) * 10) / 10));
    onDeviceValueChange?.(ac.id, nextTemp);
  };

  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden mt-4 border border-white/10 transition-all duration-500 select-none ${
        isExpanded ? 'h-[440px]' : 'h-[360px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #151624 0%, #0f1019 65%, #0a0b12 100%)',
      }}
    >
      {/* 1. ROOM AMBIENT LIGHTING OVERLAYS */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out z-10"
        style={{
          opacity: roomAmbientOpacity,
          background: 'radial-gradient(circle at 45% 35%, rgba(251, 191, 36, 0.32) 0%, rgba(245, 158, 11, 0.14) 40%, rgba(168, 85, 247, 0.06) 75%, transparent 100%)',
        }}
      />

      {/* Dark night mode tint when both lights are off */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 z-10 bg-[#06070c]/70"
        style={{
          opacity: lightLevel < 10 ? 0.92 : 0,
        }}
      />

      {/* 2. ARCHITECTURAL PERSPECTIVE LINES & FLOOR */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        {/* Ceiling border */}
        <line x1="0" y1="46" x2="100%" y2="46" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        {/* Perspective wall corners */}
        <line x1="0" y1="46" x2="70" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <line x1="100%" y1="46" x2="calc(100% - 70px)" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        {/* Floor baseboard line */}
        <line x1="0" y1="calc(100% - 82px)" x2="100%" y2="calc(100% - 82px)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        {/* Parquet floor perspective lines */}
        <line x1="15%" y1="calc(100% - 82px)" x2="8%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="30%" y1="calc(100% - 82px)" x2="25%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="70%" y1="calc(100% - 82px)" x2="75%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="85%" y1="calc(100% - 82px)" x2="92%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      </svg>

      {/* Floor parquet gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[82px] bg-gradient-to-t from-[#0b0c13] via-[#12131d] to-[#181926] border-t border-white/[0.06] z-0" />

      {/* 3. WARDROBE (LEFT WALL DECORATION) */}
      <div className="absolute top-12 left-2 sm:left-4 z-10 w-20 sm:w-24 h-56 bg-[#161723] rounded-lg border border-white/10 shadow-xl overflow-hidden flex">
        {/* Left wardrobe door */}
        <div className="w-1/2 h-full border-r border-white/10 relative bg-gradient-to-b from-[#1c1e2e] to-[#12131e] flex items-center justify-end pr-1">
          <div className="w-1 h-8 rounded-full bg-slate-500 shadow-sm" />
        </div>
        {/* Right wardrobe door */}
        <div className="w-1/2 h-full relative bg-gradient-to-b from-[#1c1e2e] to-[#12131e] flex items-center pl-1">
          <div className="w-1 h-8 rounded-full bg-slate-500 shadow-sm" />
        </div>
        {/* Top panel trim */}
        <div className="absolute top-0 inset-x-0 h-2 bg-purple-950/40 border-b border-purple-500/20" />
      </div>

      {/* 4. WALL ARTWORK ABOVE HEADBOARD */}
      <div className="absolute top-14 left-[46%] -translate-x-1/2 z-10 w-44 sm:w-56 h-16 rounded-xl border border-purple-500/30 bg-[#161426]/80 backdrop-blur-sm p-1.5 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex items-center justify-center overflow-hidden">
        <div className="w-full h-full rounded-lg bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-indigo-950/60 flex items-center justify-between px-3 relative">
          <div className="w-6 h-6 rounded-full border border-pink-400/40 bg-pink-500/10 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-pink-300" />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono tracking-wider text-purple-300 uppercase block font-semibold">SERENITY SUITE</span>
            <span className="text-[8px] font-mono text-gray-400">Ambient Sanctuary</span>
          </div>
          <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-purple-500/20 rounded-full blur-md" />
        </div>
      </div>

      {/* 5. WINDOW WITH MOTORIZED / SLIDING CURTAINS */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Bedroom Curtains: ${curtains.isOn ? 'Open' : 'Closed'}`}
        className="absolute top-12 right-3 sm:right-6 z-10 w-32 sm:w-40 h-48 group cursor-pointer focus:outline-none"
        onClick={() => onToggleDevice(curtains.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(curtains.id);
          }
        }}
      >
        {/* Curtain Rod */}
        <div className="w-full h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full shadow-md mb-0.5" />

        {/* Window Architectural Opening */}
        <div className="relative w-full h-40 rounded-xl border-2 border-[#2b2d3d] overflow-hidden bg-[#0a0f1d] shadow-2xl group-hover:border-purple-400/60 transition-colors">
          {/* Outdoor Starry Night Landscape */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060c20] via-[#101736] to-[#1c1833]">
            {/* Crescent Moon */}
            <div className="absolute top-3 right-4 w-5 h-5 rounded-full bg-amber-100 shadow-[0_0_12px_rgba(254,243,199,0.9)] opacity-95" />
            <div className="absolute top-3 right-5 w-4 h-4 rounded-full bg-[#060c20]" />
            {/* Stars */}
            <div className="absolute top-5 left-5 w-1 h-1 rounded-full bg-white opacity-90 animate-pulse" />
            <div className="absolute top-10 right-10 w-1 h-1 rounded-full bg-white opacity-80" />
            <div className="absolute top-16 left-12 w-1.5 h-1.5 rounded-full bg-purple-200 opacity-70" />
            <div className="absolute top-24 right-5 w-1 h-1 rounded-full bg-white opacity-60" />
            {/* Distant City Skyline Silhouettes */}
            <div className="absolute bottom-0 inset-x-0 h-10 flex items-end justify-around opacity-40">
              <div className="w-4 h-7 bg-[#05060d]" />
              <div className="w-6 h-9 bg-[#04050b]" />
              <div className="w-5 h-6 bg-[#05060d]" />
              <div className="w-7 h-10 bg-[#04050b]" />
            </div>
          </div>

          {/* Window Frame Panes */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-10">
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-white/10" />
            <div />
          </div>

          {/* DUAL FABRIC CURTAINS (LEFT & RIGHT PANELS) */}
          {/* Left Curtain Panel */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#2e1d44] via-[#452763] to-[#29173d] border-r-2 border-purple-400/40 transition-all duration-750 ease-in-out z-20 shadow-2xl flex flex-col justify-around py-2"
            style={{
              width: curtains.isOn ? '16%' : '50%',
            }}
          >
            {/* Realistic vertical drape folds */}
            <div className="w-full flex justify-around opacity-30 h-full">
              <div className="w-0.5 bg-black h-full" />
              <div className="w-0.5 bg-purple-300 h-full" />
              <div className="w-0.5 bg-black h-full" />
            </div>
            {/* Tieback band when open */}
            {curtains.isOn && (
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-full h-3 bg-amber-500/70 rounded-l shadow" />
            )}
          </div>

          {/* Right Curtain Panel */}
          <div 
            className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-[#2e1d44] via-[#452763] to-[#29173d] border-l-2 border-purple-400/40 transition-all duration-750 ease-in-out z-20 shadow-2xl flex flex-col justify-around py-2"
            style={{
              width: curtains.isOn ? '16%' : '50%',
            }}
          >
            {/* Realistic vertical drape folds */}
            <div className="w-full flex justify-around opacity-30 h-full">
              <div className="w-0.5 bg-black h-full" />
              <div className="w-0.5 bg-purple-300 h-full" />
              <div className="w-0.5 bg-black h-full" />
            </div>
            {/* Tieback band when open */}
            {curtains.isOn && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-3 bg-amber-500/70 rounded-r shadow" />
            )}
          </div>
        </div>

        {/* Status Label */}
        <div className="text-center mt-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-purple-400/50">
            Curtains: {curtains.isOn ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
      </div>

      {/* 6. CEILING LIGHT FIXTURE */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Bedroom Ceiling Light: ${ceilingLight.isOn ? `${ceilingLight.value ?? 75}%` : 'OFF'}`}
        className="absolute top-0 left-[38%] -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer focus:outline-none"
        onClick={() => onToggleDevice(ceilingLight.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(ceilingLight.id);
          }
        }}
      >
        {/* Drop cord */}
        <div className="w-1 h-7 bg-gray-600 transition-colors group-hover:bg-amber-400" />
        
        {/* Modern Pendant Housing */}
        <div className={`relative px-4 py-2 rounded-b-2xl border transition-all duration-300 group-hover:scale-105 ${
          ceilingLight.isOn 
            ? 'bg-[#3b2d18] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.55)]' 
            : 'bg-[#1e2029] border-white/10'
        }`}>
          <Lightbulb className={`w-5 h-5 transition-colors ${
            ceilingLight.isOn 
              ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]' 
              : 'text-gray-500'
          }`} />
        </div>

        {/* Radial light cone down to the bed */}
        {ceilingLight.isOn && (
          <div 
            className="absolute top-12 -left-28 w-64 h-72 pointer-events-none transition-all duration-500"
            style={{
              opacity: (ceilingLight.value ?? 75) / 100,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.42) 0%, rgba(245, 158, 11, 0.16) 40%, transparent 75%)',
              clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
            }}
          />
        )}

        {/* Status label */}
        <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 opacity-80 group-hover:opacity-100 group-hover:border-amber-400/50">
          Ceiling Light: {ceilingLight.isOn ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* 7. CEILING FAN WITH ROTATING BLADES */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Bedroom Fan: ${fan.isOn ? 'Active' : 'Off'}`}
        className="absolute top-2 left-[58%] -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer focus:outline-none"
        onClick={() => onToggleDevice(fan.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(fan.id);
          }
        }}
      >
        {/* Drop rod */}
        <div className="w-1.5 h-6 bg-slate-500 transition-colors group-hover:bg-sky-400" />
        
        {/* Motor Hub & Rotating Blades */}
        <div className="relative w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
          <div 
            className={`w-14 h-14 transition-all ${fan.isOn ? 'animate-spin' : ''}`}
            style={{
              animationDuration: fan.isOn ? '0.65s' : '0s',
              animationTimingFunction: 'linear',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <ellipse cx="50" cy="18" rx="7.5" ry="18" fill="#64748b" />
              <ellipse cx="50" cy="82" rx="7.5" ry="18" fill="#64748b" />
              <ellipse cx="18" cy="50" rx="18" ry="7.5" fill="#64748b" />
              <ellipse cx="82" cy="50" rx="18" ry="7.5" fill="#64748b" />
              <circle cx="50" cy="50" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
          
          {/* Center LED */}
          <span className={`absolute w-2 h-2 rounded-full ${
            fan.isOn
              ? 'bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]'
              : 'bg-gray-600'
          }`} />
        </div>

        {/* Status label */}
        <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 opacity-80 group-hover:opacity-100 group-hover:border-sky-400/50">
          Bedroom Fan: {fan.isOn ? 'ACTIVE' : 'OFF'}
        </span>
      </div>

      {/* 8. WALL-MOUNTED AIR CONDITIONER WITH TEMP DISPLAY & ADJUSTMENT */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Bedroom AC: ${ac.isOn ? `Cooling at ${ac.value ?? 20.5}°C` : 'Off'}`}
        className="absolute top-3 left-3 sm:left-6 z-20 w-44 sm:w-52 group cursor-pointer select-none focus:outline-none"
        onClick={() => onToggleDevice(ac.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(ac.id);
          }
        }}
      >
        <div className={`relative px-3 py-2 rounded-xl border transition-all duration-300 group-hover:border-sky-400/70 ${
          ac.isOn 
            ? 'bg-[#18212e] border-sky-400/50 shadow-[0_4px_20px_rgba(56,189,248,0.25)]' 
            : 'bg-[#161720] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wind className={`w-3.5 h-3.5 ${ac.isOn ? 'text-sky-300 animate-bounce' : 'text-gray-500'}`} />
              <span className="text-[10px] font-semibold text-gray-300 tracking-tight">BEDROOM AC</span>
            </div>

            {/* Digital LED Temperature Display & Quick Temperature Buttons */}
            <div className="flex items-center gap-1">
              <div className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold tracking-wider ${
                ac.isOn 
                  ? 'bg-sky-950 text-sky-300 border border-sky-500/40 shadow-[0_0_8px_rgba(56,189,248,0.5)]' 
                  : 'bg-black/50 text-gray-600'
              }`}>
                {ac.isOn ? `${ac.value ?? 20.5}°C` : '--.-°C'}
              </div>

              {/* In-simulation temp steppers */}
              {ac.isOn && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => handleAdjustTemp(-0.5, e)}
                    className="p-1 rounded bg-black/40 hover:bg-sky-600/40 text-gray-400 hover:text-white transition"
                    aria-label="Decrease bedroom temperature"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => handleAdjustTemp(0.5, e)}
                    className="p-1 rounded bg-black/40 hover:bg-sky-600/40 text-gray-400 hover:text-white transition"
                    aria-label="Increase bedroom temperature"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Air louver vent */}
          <div className="w-full h-1 bg-black/40 rounded-full mt-1.5 overflow-hidden">
            <div className={`h-full transition-all ${ac.isOn ? 'bg-sky-400' : 'bg-transparent'}`} />
          </div>
        </div>

        {/* Visible Cool Air Mist Streamlines */}
        {ac.isOn && (
          <div className="relative w-full h-12 overflow-hidden pointer-events-none mt-0.5 flex justify-around">
            <div className="w-1 bg-gradient-to-b from-sky-400/70 to-transparent rounded-full animate-pulse" style={{ height: '70%', animationDuration: '1.2s' }} />
            <div className="w-1.5 bg-gradient-to-b from-cyan-300/80 to-transparent rounded-full animate-pulse" style={{ height: '95%', animationDuration: '0.9s', animationDelay: '0.2s' }} />
            <div className="w-1 bg-gradient-to-b from-sky-400/70 to-transparent rounded-full animate-pulse" style={{ height: '80%', animationDuration: '1.4s', animationDelay: '0.4s' }} />
            <div className="w-1.5 bg-gradient-to-b from-cyan-300/80 to-transparent rounded-full animate-pulse" style={{ height: '90%', animationDuration: '1.1s', animationDelay: '0.1s' }} />
          </div>
        )}

        {/* Status label */}
        <div className="text-center">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-sky-400/50">
            AC: {ac.isOn ? `${ac.value ?? 20.5}°C Cooling` : 'OFF'}
          </span>
        </div>
      </div>

      {/* 9. PLUSH BEDROOM AREA RUG UNDER BED */}
      <div className="absolute bottom-2 left-[20%] right-[20%] h-20 rounded-3xl bg-gradient-to-b from-[#251f33] via-[#1c1829] to-[#14121d] border border-purple-500/20 shadow-xl pointer-events-none flex items-center justify-between px-3">
        <div className="w-full h-full border border-purple-400/10 rounded-2xl flex items-center justify-center opacity-40">
          <div className="w-4/5 h-2/3 border-b border-t border-purple-400/15 border-dashed" />
        </div>
      </div>

      {/* 10. LEFT BEDSIDE TABLE & LAMP */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Left Bedside Lamp: ${bedsideLamp.isOn ? 'ON' : 'OFF'}`}
        className="absolute bottom-6 left-[18%] sm:left-[22%] z-20 flex flex-col items-center group cursor-pointer focus:outline-none"
        onClick={() => onToggleDevice(bedsideLamp.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(bedsideLamp.id);
          }
        }}
      >
        {/* Lamp Shade with Warm Illumination Glow */}
        <div className={`w-8 h-6 rounded-t-md transition-all duration-300 border flex items-center justify-center group-hover:scale-105 ${
          bedsideLamp.isOn 
            ? 'bg-[#fbbf24] border-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.85)] text-amber-950' 
            : 'bg-[#252838] border-white/10 text-gray-500'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
        </div>

        {/* Lamp stem & base */}
        <div className="w-1 h-5 bg-gradient-to-b from-amber-600 to-gray-600" />
        <div className="w-5 h-1.5 rounded-full bg-gray-700 border border-white/20" />

        {/* Nightstand Table */}
        <div className="w-14 h-12 mt-0.5 rounded-lg bg-[#1c1d2b] border border-white/10 shadow-lg p-1 flex flex-col justify-between">
          {/* Table surface item: Glowing digital alarm clock */}
          <div className="flex items-center justify-center gap-0.5 text-[8px] font-mono text-cyan-300 bg-black/60 rounded px-1 py-0.5 border border-cyan-500/30">
            <Clock className="w-2 h-2 text-cyan-400" />
            <span>07:30</span>
          </div>
          {/* Drawer pull handle */}
          <div className="w-8 h-1 mx-auto bg-slate-500 rounded-full" />
        </div>

        {/* Ambient floor puddle of warm light */}
        {bedsideLamp.isOn && (
          <div 
            className="absolute -bottom-2 w-24 h-8 rounded-full bg-amber-400/25 blur-md pointer-events-none"
            style={{ opacity: (bedsideLamp.value ?? 50) / 100 }}
          />
        )}
      </div>

      {/* 11. THE BED (CENTERPIECE) */}
      <div className="absolute bottom-2 left-[31%] sm:left-[33%] w-52 sm:w-64 z-20 flex flex-col items-center pointer-events-none">
        {/* Headboard with tufted panels & ambient edge backlight */}
        <div className="relative w-full h-16 rounded-t-2xl bg-gradient-to-b from-[#2e2640] via-[#201b2d] to-[#181522] border-t-2 border-x-2 border-purple-400/40 shadow-2xl flex items-center justify-around px-4">
          <div className="w-0.5 h-10 bg-purple-950/60" />
          <div className="w-0.5 h-10 bg-purple-950/60" />
          <div className="w-0.5 h-10 bg-purple-950/60" />
          <div className="w-0.5 h-10 bg-purple-950/60" />
          {/* Top edge glow strip */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
        </div>

        {/* Mattress & Pillows Layer */}
        <div className="relative w-[96%] h-18 bg-[#25283b] rounded-t-xl border border-white/10 -mt-2 p-1.5 flex flex-col justify-between">
          {/* Pillows (2 pairs) */}
          <div className="flex items-center justify-around px-2 pt-0.5">
            {/* Left pillow pair */}
            <div className="relative flex items-center">
              <div className="w-12 h-6 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 shadow-md border border-white/30 transform -rotate-3" />
              <div className="w-8 h-5 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 shadow-md -ml-3 z-10 border border-white/20 transform rotate-2" />
            </div>
            {/* Right pillow pair */}
            <div className="relative flex items-center">
              <div className="w-8 h-5 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 shadow-md -mr-3 z-10 border border-white/20 transform -rotate-2" />
              <div className="w-12 h-6 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 shadow-md border border-white/30 transform rotate-3" />
            </div>
          </div>

          {/* Cozy Duvet / Blanket with stylized fabric folds & Bed Runner */}
          <div className="w-full h-11 rounded-t-lg bg-gradient-to-b from-[#241c38] via-[#1a1528] to-[#120f1c] border-t-2 border-purple-500/30 relative overflow-hidden flex flex-col justify-between p-1">
            {/* Folded Sheet Top Edge */}
            <div className="w-full h-2 rounded bg-slate-300/80 shadow-sm" />
            {/* Contrast decorative runner strip across foot of bed */}
            <div className="w-full h-3 rounded bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 shadow-inner flex items-center justify-center text-[7px] font-mono text-white/80">
              SMART COMFORT
            </div>
          </div>
        </div>

        {/* Bed Base & Legs */}
        <div className="w-full h-3 bg-[#11121a] rounded-b border-b border-x border-white/10 flex justify-between px-3">
          <div className="w-2 h-2.5 bg-amber-800 rounded-b" />
          <div className="w-2 h-2.5 bg-amber-800 rounded-b" />
        </div>
      </div>

      {/* 12. RIGHT BEDSIDE TABLE & LAMP */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Right Bedside Lamp: ${bedsideLamp.isOn ? 'ON' : 'OFF'}`}
        className="absolute bottom-6 right-[18%] sm:right-[22%] z-20 flex flex-col items-center group cursor-pointer focus:outline-none"
        onClick={() => onToggleDevice(bedsideLamp.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(bedsideLamp.id);
          }
        }}
      >
        {/* Lamp Shade with Warm Illumination Glow */}
        <div className={`w-8 h-6 rounded-t-md transition-all duration-300 border flex items-center justify-center group-hover:scale-105 ${
          bedsideLamp.isOn 
            ? 'bg-[#fbbf24] border-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.85)] text-amber-950' 
            : 'bg-[#252838] border-white/10 text-gray-500'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
        </div>

        {/* Lamp stem & base */}
        <div className="w-1 h-5 bg-gradient-to-b from-amber-600 to-gray-600" />
        <div className="w-5 h-1.5 rounded-full bg-gray-700 border border-white/20" />

        {/* Nightstand Table */}
        <div className="w-14 h-12 mt-0.5 rounded-lg bg-[#1c1d2b] border border-white/10 shadow-lg p-1 flex flex-col justify-between">
          {/* Table surface item: Small potted plant */}
          <div className="flex items-center justify-center">
            <div className="w-3.5 h-3 rounded-b-md bg-stone-700 border border-white/20 relative">
              <div className="absolute -top-1 left-0.5 w-2.5 h-2 rounded-full bg-emerald-500 shadow-sm" />
            </div>
          </div>
          {/* Drawer pull handle */}
          <div className="w-8 h-1 mx-auto bg-slate-500 rounded-full" />
        </div>

        {/* Ambient floor puddle of warm light */}
        {bedsideLamp.isOn && (
          <div 
            className="absolute -bottom-2 w-24 h-8 rounded-full bg-amber-400/25 blur-md pointer-events-none"
            style={{ opacity: (bedsideLamp.value ?? 50) / 100 }}
          />
        )}
      </div>

      {/* Bedside Lamp Central Status Indicator Badge */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-black/75 border border-white/15 text-gray-300">
          Bedside Lamps: {bedsideLamp.isOn ? 'ON (WARM GLOW)' : 'OFF'}
        </span>
      </div>
    </div>
  );
};
