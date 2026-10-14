import React, { useState } from 'react';
import { 
  Lightbulb, 
  Tv, 
  Wind, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Lamp, 
  Eye 
} from 'lucide-react';
import type { Device, RoomId } from '../types';
import { BedroomSimulation } from './BedroomSimulation';
import { KitchenSimulation } from './KitchenSimulation';

interface InteractiveRoomSimulationProps {
  devices: Device[];
  selectedRoom: RoomId;
  onSelectRoom: (roomId: RoomId) => void;
  onToggleDevice: (id: string) => void;
  onDeviceValueChange?: (id: string, value: number) => void;
}

export const InteractiveRoomSimulation: React.FC<InteractiveRoomSimulationProps> = ({
  devices,
  selectedRoom,
  onSelectRoom,
  onToggleDevice,
  onDeviceValueChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Retrieve relevant devices
  const mainCeiling = devices.find((d) => d.id === 'living_room_main') || {
    id: 'living_room_main',
    name: 'Main Ceiling',
    isOn: true,
    value: 80,
  };

  const readingLamp = devices.find((d) => d.id === 'reading_lamp') || {
    id: 'reading_lamp',
    name: 'Reading Lamp',
    isOn: true,
    value: 40,
  };

  const airCirculator = devices.find((d) => d.id === 'living_room_fan') || {
    id: 'living_room_fan',
    name: 'Air Circulator',
    isOn: true,
  };

  const windowShades = devices.find((d) => d.id === 'living_room_shades') || {
    id: 'living_room_shades',
    name: 'Window Shades',
    isOn: false,
  };

  const livingRoomTv = devices.find((d) => d.id === 'living_room_tv') || {
    id: 'living_room_tv',
    name: 'Living Room TV',
    isOn: true,
  };

  const bedroomAc = devices.find((d) => d.id === 'bedroom_ac') || {
    id: 'bedroom_ac',
    name: 'Bedroom AC',
    isOn: true,
    value: 20.5,
  };

  const bedroomFan = devices.find((d) => d.id === 'bedroom_fan') || {
    id: 'bedroom_fan',
    name: 'Bedroom Fan',
    isOn: false,
  };

  const kitchenLight = devices.find((d) => d.id === 'kitchen_light') || {
    id: 'kitchen_light',
    name: 'Kitchen Light',
    isOn: false,
    value: 100,
  };

  const isLivingRoom = selectedRoom === 'living_room';
  const isBedroom = selectedRoom === 'bedroom';
  const isKitchen = selectedRoom === 'kitchen';

  const bedroomCeiling = devices.find((d) => d.id === 'bedroom_ceiling_light') || { isOn: true, value: 75 };
  const bedroomBedside = devices.find((d) => d.id === 'bedroom_bedside_lamp') || { isOn: true, value: 50 };
  const kitchenCounter = devices.find((d) => d.id === 'kitchen_counter_light') || { isOn: true, value: 80 };

  // Room illumination intensity responds faithfully to light states
  const lightLevel = isLivingRoom
    ? (mainCeiling.isOn ? (mainCeiling.value ?? 80) : 0) * 0.7 + (readingLamp.isOn ? (readingLamp.value ?? 40) : 0) * 0.3
    : isBedroom
    ? (bedroomCeiling.isOn ? (bedroomCeiling.value ?? 75) : 0) * 0.65 + (bedroomBedside.isOn ? (bedroomBedside.value ?? 50) : 0) * 0.35
    : isKitchen
    ? (kitchenLight.isOn ? (kitchenLight.value ?? 90) : 0) * 0.6 + (kitchenCounter.isOn ? (kitchenCounter.value ?? 80) : 0) * 0.4
    : 40;

  const roomAmbientOpacity = Math.max(0.15, lightLevel / 100);

  // Active fan for current room
  const currentFan = isBedroom ? bedroomFan : airCirculator;
  const isFanSpinning = currentFan.isOn;

  return (
    <div className={`relative bg-[#13141c] border border-white/[0.08] rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl ${isExpanded ? 'p-6' : 'p-5'}`}>
      {/* Simulation Header & Room Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Interactive 2D Home Interior Simulation</span>
              <span className="text-[10px] font-mono uppercase bg-pink-500/10 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/20">
                Live State
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Directly click appliances inside the room to toggle or test voice commands.
            </p>
          </div>
        </div>

        {/* Room Switcher Pills & Expand */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-[#1a1b24] p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => onSelectRoom('living_room')}
              aria-label="Select Living Room"
              className={`px-3 py-1 rounded-lg font-medium transition ${
                isLivingRoom
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Living Room
            </button>
            <button
              onClick={() => onSelectRoom('bedroom')}
              aria-label="Select Bedroom"
              className={`px-3 py-1 rounded-lg font-medium transition ${
                isBedroom
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bedroom
            </button>
            <button
              onClick={() => onSelectRoom('kitchen')}
              aria-label="Select Kitchen"
              className={`px-3 py-1 rounded-lg font-medium transition ${
                isKitchen
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Kitchen
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#1a1b24] text-gray-400 hover:text-white border border-white/5 transition"
            aria-label={isExpanded ? "Collapse view" : "Expand view"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2D Realistic Room Simulation Stage */}
      {isBedroom ? (
        <BedroomSimulation
          devices={devices}
          onToggleDevice={onToggleDevice}
          onDeviceValueChange={onDeviceValueChange}
          isExpanded={isExpanded}
        />
      ) : isKitchen ? (
        <KitchenSimulation
          devices={devices}
          onToggleDevice={onToggleDevice}
          onDeviceValueChange={onDeviceValueChange}
          isExpanded={isExpanded}
        />
      ) : (
      <div 
        className={`relative w-full rounded-2xl overflow-hidden mt-4 border border-white/10 transition-all duration-500 ${
          isExpanded ? 'h-[440px]' : 'h-[360px]'
        }`}
        style={{
          background: 'linear-gradient(180deg, #181926 0%, #11121a 70%, #0d0d14 100%)',
        }}
      >
        {/* ROOM CEILING AMBIENT LIGHTING OVERLAY */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out z-10"
          style={{
            opacity: roomAmbientOpacity,
            background: 'radial-gradient(circle at 45% 25%, rgba(251, 191, 36, 0.35) 0%, rgba(217, 119, 6, 0.15) 45%, rgba(168, 85, 247, 0.05) 75%, transparent 100%)',
          }}
        />

        {/* Ambient Dark Night Mode Tint when all lights are off */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-700 z-10 bg-[#07080d]/65"
          style={{
            opacity: lightLevel < 10 ? 0.9 : 0,
          }}
        />

        {/* Architectural Room Perspective Lines & Floor */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="50" x2="100%" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
          <line x1="0" y1="50" x2="60" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="100%" y1="50" x2="calc(100% - 60px)" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="0" y1="calc(100% - 75px)" x2="100%" y2="calc(100% - 75px)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <line x1="20%" y1="calc(100% - 75px)" x2="10%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="40%" y1="calc(100% - 75px)" x2="35%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="60%" y1="calc(100% - 75px)" x2="65%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="80%" y1="calc(100% - 75px)" x2="90%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        </svg>

        {/* Floor reflection */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[75px] bg-gradient-to-t from-[#0e0f17] to-[#161724] border-t border-white/[0.06] z-0"
        />

        {/* ======================================================== */}
        {/* APPLIANCE 1: CEILING LIGHT FIXTURE                       */}
        {/* ======================================================== */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={isKitchen ? `Kitchen Light: ${kitchenLight.isOn ? 'ON' : 'OFF'}` : `Main Ceiling Light: ${mainCeiling.isOn ? `${mainCeiling.value ?? 80}%` : 'OFF'}`}
          className="absolute top-0 left-[42%] -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer focus:outline-none"
          onClick={() => onToggleDevice(isKitchen ? kitchenLight.id : mainCeiling.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleDevice(isKitchen ? kitchenLight.id : mainCeiling.id);
            }
          }}
        >
          {/* Ceiling wire */}
          <div className="w-1 h-7 bg-gray-600 transition-colors group-hover:bg-amber-400" />
          
          {/* Lamp shade / fixture housing */}
          <div className={`relative px-5 py-2 rounded-b-2xl border transition-all duration-300 group-hover:scale-105 ${
            (isKitchen ? kitchenLight.isOn : mainCeiling.isOn)
              ? 'bg-[#3b2d18] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]' 
              : 'bg-[#1e2029] border-white/10'
          }`}>
            <Lightbulb className={`w-5 h-5 transition-colors ${
              (isKitchen ? kitchenLight.isOn : mainCeiling.isOn) 
                ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]' 
                : 'text-gray-500'
            }`} />
          </div>

          {/* Radial Light Cone casting downwards when active */}
          {(isKitchen ? kitchenLight.isOn : mainCeiling.isOn) && (
            <div 
              className="absolute top-12 -left-32 w-72 h-80 pointer-events-none transition-all duration-500"
              style={{
                opacity: (isKitchen ? (kitchenLight.value ?? 100) : (mainCeiling.value ?? 80)) / 100,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.18) 40%, transparent 75%)',
                clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
              }}
            />
          )}

          {/* Persistent status label */}
          <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 opacity-80 group-hover:opacity-100 group-hover:border-amber-400/50">
            {isKitchen ? 'Kitchen Light' : 'Ceiling Light'}: {(isKitchen ? kitchenLight.isOn : mainCeiling.isOn) ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* ======================================================== */}
        {/* APPLIANCE 2: AIR CIRCULATOR / BEDROOM FAN                */}
        {/* ======================================================== */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={isBedroom ? `Bedroom Fan: ${isFanSpinning ? 'Active' : 'Off'}` : `Air Circulator Fan: ${isFanSpinning ? 'Active' : 'Off'}`}
          className="absolute top-2 left-[62%] -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer focus:outline-none"
          onClick={() => onToggleDevice(currentFan.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleDevice(currentFan.id);
            }
          }}
        >
          {/* Fan drop rod */}
          <div className="w-1.5 h-6 bg-slate-500 transition-colors group-hover:bg-sky-400" />
          
          {/* Motor Hub & Rotating Blades */}
          <div className="relative w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
            {/* Blades SVG */}
            <div 
              className={`w-14 h-14 transition-all ${
                isFanSpinning ? 'animate-spin' : ''
              }`}
              style={{
                animationDuration: isFanSpinning ? '0.7s' : '0s',
                animationTimingFunction: 'linear',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <ellipse cx="50" cy="18" rx="8" ry="18" fill="#64748b" />
                <ellipse cx="50" cy="82" rx="8" ry="18" fill="#64748b" />
                <ellipse cx="18" cy="50" rx="18" ry="8" fill="#64748b" />
                <ellipse cx="82" cy="50" rx="18" ry="8" fill="#64748b" />
                <circle cx="50" cy="50" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>
            
            {/* Center status LED */}
            <span className={`absolute w-2 h-2 rounded-full ${
              isFanSpinning
                ? 'bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]'
                : 'bg-gray-600'
            }`} />
          </div>

          {/* Persistent status label */}
          <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 opacity-80 group-hover:opacity-100 group-hover:border-sky-400/50">
            {isBedroom ? 'Bedroom Fan' : 'Circulator Fan'}: {isFanSpinning ? 'ACTIVE' : 'OFF'}
          </span>
        </div>

        {/* ======================================================== */}
        {/* APPLIANCE 3: WINDOW & PHYSICAL MOTORIZED SHADES          */}
        {/* ======================================================== */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Window Shades: ${windowShades.isOn ? 'Open' : 'Closed'}`}
          className="absolute top-16 left-6 z-10 w-36 sm:w-44 h-48 group cursor-pointer select-none focus:outline-none"
          onClick={() => onToggleDevice(windowShades.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleDevice(windowShades.id);
            }
          }}
        >
          {/* Window Frame Architectural Outline */}
          <div className="relative w-full h-full rounded-2xl border-2 border-[#2b2d3d] overflow-hidden bg-[#0d1322] shadow-xl group-hover:border-indigo-400/60 transition-colors">
            {/* Outdoor Background View */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a122c] via-[#161c38] to-[#1c1a36]">
              <div className="absolute top-3 right-4 w-5 h-5 rounded-full bg-amber-100 shadow-[0_0_12px_rgba(254,243,199,0.9)] opacity-90" />
              <div className="absolute top-6 left-6 w-1 h-1 rounded-full bg-white opacity-70" />
              <div className="absolute top-12 right-12 w-1 h-1 rounded-full bg-white opacity-60" />
              <div className="absolute bottom-6 left-0 right-0 h-10 bg-[#090b14] rounded-t-full opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-[#07080f]" />
            </div>

            {/* Window Pane Grid Crossbars */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-10">
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div />
            </div>

            {/* MOTORIZED SHADES FABRIC SLIDING LAYER */}
            <div 
              className="absolute inset-x-0 top-0 bg-[#252838] border-b-4 border-indigo-400 transition-all duration-700 ease-in-out z-20 shadow-2xl flex flex-col justify-between"
              style={{
                height: windowShades.isOn ? '15%' : '94%',
              }}
            >
              <div className="w-full h-full flex flex-col justify-around py-1 px-2 opacity-30">
                <div className="h-0.5 bg-black" />
                <div className="h-0.5 bg-black" />
                <div className="h-0.5 bg-black" />
                <div className="h-0.5 bg-black" />
                <div className="h-0.5 bg-black" />
                <div className="h-0.5 bg-black" />
              </div>
              <div className="text-center text-[9px] font-mono text-indigo-300 py-0.5 bg-indigo-950/60 border-t border-indigo-500/20">
                {windowShades.isOn ? 'RETRACTED' : 'CLOSED'}
              </div>
            </div>
          </div>

          {/* Persistent status label */}
          <div className="text-center mt-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-indigo-400/50">
              Shades: {windowShades.isOn ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* APPLIANCE 4: SMART TELEVISION WITH AMBIENT SCREEN       */}
        {/* ======================================================== */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Television: ${livingRoomTv.isOn ? 'On (HDMI 1)' : 'Standby'}`}
          className="absolute top-14 right-8 sm:right-16 z-10 w-44 sm:w-56 h-32 group cursor-pointer select-none focus:outline-none"
          onClick={() => onToggleDevice(livingRoomTv.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleDevice(livingRoomTv.id);
            }
          }}
        >
          {/* Wall-Mount Backlight Glow when ON */}
          {livingRoomTv.isOn && (
            <div className="absolute -inset-2 bg-purple-600/30 blur-xl rounded-2xl transition-opacity duration-500 animate-pulse" />
          )}

          {/* Slim TV Bezel Housing */}
          <div className={`relative w-full h-full rounded-xl p-1 border-2 transition-all duration-300 group-hover:border-purple-400 ${
            livingRoomTv.isOn 
              ? 'bg-[#151324] border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'bg-[#0f1015] border-white/10'
          }`}>
            {/* TV Screen Glass */}
            <div className={`w-full h-full rounded-lg overflow-hidden relative flex flex-col items-center justify-center transition-colors duration-500 ${
              livingRoomTv.isOn 
                ? 'bg-gradient-to-tr from-[#3b0764] via-[#6b21a8] to-[#db2777]' 
                : 'bg-[#090a0f]'
            }`}>
              {livingRoomTv.isOn ? (
                <div className="w-full h-full p-2.5 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-semibold tracking-wider text-pink-200 z-10">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      4K UHD HDR
                    </span>
                    <span>21:58 PM</span>
                  </div>

                  <div className="text-center my-auto z-10">
                    <p className="text-[11px] font-bold text-white drop-shadow">CYBERPUNK NEON</p>
                    <p className="text-[9px] text-pink-200">Voice-Controlled Media Hub</p>
                  </div>

                  <div className="w-full bg-black/30 rounded-full h-1 overflow-hidden z-10">
                    <div className="bg-pink-400 h-full w-2/3" />
                  </div>

                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none" />
                </div>
              ) : (
                <div className="text-center">
                  <Tv className="w-6 h-6 text-gray-700 mx-auto" />
                  <span className="text-[9px] text-gray-600 font-mono mt-1 block">STANDBY</span>
                </div>
              )}
            </div>

            {/* Power LED Indicator */}
            <div className={`absolute bottom-0 right-3 w-1.5 h-1.5 rounded-full ${
              livingRoomTv.isOn ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' : 'bg-rose-500'
            }`} />
          </div>

          {/* Persistent status label */}
          <div className="text-center mt-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-purple-400/50">
              TV: {livingRoomTv.isOn ? 'ON (HDMI 1)' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* APPLIANCE 5: WALL-MOUNTED AC WITH DIGITAL LED & AIRFLOW  */}
        {/* ======================================================== */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Climate AC Unit: ${bedroomAc.isOn ? `Cooling at ${bedroomAc.value ?? 20.5}°C` : 'Off'}`}
          className="absolute top-3 left-4 sm:left-12 z-20 w-40 sm:w-48 group cursor-pointer select-none focus:outline-none"
          onClick={() => onToggleDevice(bedroomAc.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleDevice(bedroomAc.id);
            }
          }}
        >
          {/* AC Chassis Body */}
          <div className={`relative px-3 py-2 rounded-xl border transition-all duration-300 group-hover:border-sky-400/70 ${
            bedroomAc.isOn 
              ? 'bg-[#18212e] border-sky-400/50 shadow-[0_4px_20px_rgba(56,189,248,0.25)]' 
              : 'bg-[#161720] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wind className={`w-3.5 h-3.5 ${bedroomAc.isOn ? 'text-sky-300 animate-bounce' : 'text-gray-500'}`} />
                <span className="text-[10px] font-semibold text-gray-300">CLIMATE AC</span>
              </div>

              {/* Digital LED 7-Segment Temperature Readout */}
              <div className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold tracking-wider ${
                bedroomAc.isOn 
                  ? 'bg-sky-950 text-sky-300 border border-sky-500/40 shadow-[0_0_8px_rgba(56,189,248,0.5)]' 
                  : 'bg-black/50 text-gray-600'
              }`}>
                {bedroomAc.isOn ? `${bedroomAc.value ?? 20.5}°C` : '--.-°C'}
              </div>
            </div>

            {/* Bottom air louver vent slit */}
            <div className="w-full h-1 bg-black/40 rounded-full mt-1.5 overflow-hidden">
              <div className={`h-full transition-all ${bedroomAc.isOn ? 'bg-sky-400' : 'bg-transparent'}`} />
            </div>
          </div>

          {/* REALISTIC VISIBLE COOL AIRFLOW MIST PARTICLES WHEN RUNNING */}
          {bedroomAc.isOn && (
            <div className="relative w-full h-14 overflow-hidden pointer-events-none mt-0.5 flex justify-around">
              <div className="w-1 bg-gradient-to-b from-sky-400/70 to-transparent rounded-full animate-pulse" style={{ height: '70%', animationDuration: '1.2s' }} />
              <div className="w-1.5 bg-gradient-to-b from-cyan-300/80 to-transparent rounded-full animate-pulse" style={{ height: '95%', animationDuration: '0.9s', animationDelay: '0.2s' }} />
              <div className="w-1 bg-gradient-to-b from-sky-400/70 to-transparent rounded-full animate-pulse" style={{ height: '80%', animationDuration: '1.4s', animationDelay: '0.4s' }} />
              <div className="w-1.5 bg-gradient-to-b from-cyan-300/80 to-transparent rounded-full animate-pulse" style={{ height: '90%', animationDuration: '1.1s', animationDelay: '0.1s' }} />
            </div>
          )}

          {/* Persistent status label */}
          <div className="text-center">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-sky-400/50">
              AC: {bedroomAc.isOn ? `${bedroomAc.value ?? 20.5}°C Active` : 'OFF'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* APPLIANCE 6: READING LAMP / ACCENT FLOOR LAMP            */}
        {/* ======================================================== */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Reading Lamp: ${readingLamp.isOn ? `On at ${readingLamp.value ?? 40}%` : 'Off'}`}
          className="absolute bottom-5 right-6 sm:right-12 z-20 flex flex-col items-center group cursor-pointer focus:outline-none"
          onClick={() => onToggleDevice(readingLamp.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleDevice(readingLamp.id);
            }
          }}
        >
          {/* Glowing Lamp Shade */}
          <div className={`w-9 h-7 rounded-t-lg transition-all duration-300 border flex items-center justify-center group-hover:scale-105 ${
            readingLamp.isOn 
              ? 'bg-[#eab308] border-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.8)] text-amber-950' 
              : 'bg-[#252838] border-white/10 text-gray-500'
          }`}>
            <Lamp className="w-4 h-4" />
          </div>

          {/* Lamp Stand Pole & Heavy Base */}
          <div className="w-1 h-16 bg-gradient-to-b from-amber-600/80 to-gray-700" />
          <div className="w-8 h-2 rounded-full bg-gray-800 border border-white/20" />

          {/* Floor Light Puddle */}
          {readingLamp.isOn && (
            <div 
              className="absolute -bottom-3 w-28 h-8 rounded-full bg-amber-400/25 blur-md pointer-events-none"
              style={{ opacity: (readingLamp.value ?? 40) / 100 }}
            />
          )}

          {/* Persistent status label */}
          <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 border border-white/10 text-gray-300 opacity-80 group-hover:opacity-100 group-hover:border-amber-400/50">
            Reading Lamp: {readingLamp.isOn ? `${readingLamp.value ?? 40}%` : 'OFF'}
          </span>
        </div>

        {/* Furniture silhouette outline for living room */}
        <div className="absolute bottom-0 left-[28%] w-56 sm:w-72 h-14 bg-[#1a1b28] rounded-t-2xl border-t-2 border-x-2 border-white/[0.07] pointer-events-none flex items-center justify-center text-[10px] text-gray-400 font-medium">
          <span>Living Room Sofa Lounge</span>
        </div>
      </div>
      )}

      {/* Interactive Helper Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-white/[0.05] text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>
            {isBedroom ? (
              <>Click any fixture above or say: <strong className="text-gray-200">"Turn on the bedroom fan"</strong>, <strong className="text-gray-200">"Set bedroom AC to 22 degrees"</strong>, <strong className="text-gray-200">"Open bedroom curtains"</strong>.</>
            ) : isKitchen ? (
              <>Click any fixture above or say: <strong className="text-gray-200">"Turn on the kitchen lights"</strong>, <strong className="text-gray-200">"Turn on kitchen exhaust fan"</strong>, <strong className="text-gray-200">"Turn off kitchen cooktop"</strong>.</>
            ) : (
              <>Click any fixture above or say: <strong className="text-gray-200">"Turn on the living room light"</strong>, <strong className="text-gray-200">"Open window shades"</strong>.</>
            )}
          </span>
        </div>
        <div className="text-[11px] font-mono text-purple-300">
          Illumination Index: <strong className="text-white">{Math.round(lightLevel)}%</strong>
        </div>
      </div>
    </div>
  );
};
