import React from 'react';
import { 
  Lightbulb, 
  Flame, 
  Refrigerator as FridgeIcon,
  Microwave as MicroIcon
} from 'lucide-react';
import type { Device } from '../types';

interface KitchenSimulationProps {
  devices: Device[];
  onToggleDevice: (id: string) => void;
  onDeviceValueChange?: (id: string, value: number) => void;
  isExpanded?: boolean;
}

export const KitchenSimulation: React.FC<KitchenSimulationProps> = ({
  devices,
  onToggleDevice,
  isExpanded = false,
}) => {
  // Retrieve kitchen appliances
  const ceilingLight = devices.find((d) => d.id === 'kitchen_light') || {
    id: 'kitchen_light',
    name: 'Kitchen Ceiling',
    isOn: true,
    value: 90,
  };

  const counterLight = devices.find((d) => d.id === 'kitchen_counter_light') || {
    id: 'kitchen_counter_light',
    name: 'Counter Lights',
    isOn: true,
    value: 80,
  };

  const exhaustFan = devices.find((d) => d.id === 'kitchen_exhaust_fan') || {
    id: 'kitchen_exhaust_fan',
    name: 'Exhaust Fan',
    isOn: false,
  };

  const cooktop = devices.find((d) => d.id === 'kitchen_cooktop') || {
    id: 'kitchen_cooktop',
    name: 'Induction Cooktop',
    isOn: false,
  };

  const fridge = devices.find((d) => d.id === 'kitchen_fridge') || {
    id: 'kitchen_fridge',
    name: 'Smart Refrigerator',
    isOn: true,
    statusText: 'Eco Mode • 3°C',
  };

  const microwave = devices.find((d) => d.id === 'kitchen_microwave') || {
    id: 'kitchen_microwave',
    name: 'Microwave',
    isOn: false,
  };

  // Illumination calculation
  const ceilingVal = ceilingLight.isOn ? (ceilingLight.value ?? 90) : 0;
  const counterVal = counterLight.isOn ? (counterLight.value ?? 80) : 0;
  const lightLevel = ceilingVal * 0.6 + counterVal * 0.4;
  const roomAmbientOpacity = Math.max(0.15, lightLevel / 100);

  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden mt-4 border border-white/10 transition-all duration-500 select-none ${
        isExpanded ? 'h-[440px]' : 'h-[360px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #13141f 0%, #0d0e17 65%, #08090f 100%)',
      }}
    >
      {/* 1. ROOM AMBIENT ILLUMINATION OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out z-10"
        style={{
          opacity: roomAmbientOpacity,
          background: 'radial-gradient(circle at 45% 30%, rgba(251, 191, 36, 0.35) 0%, rgba(217, 119, 6, 0.15) 45%, rgba(6, 182, 212, 0.05) 75%, transparent 100%)',
        }}
      />

      {/* Dark night mode tint when both ceiling & counter lights are off */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 z-10 bg-[#06070b]/75"
        style={{
          opacity: lightLevel < 10 ? 0.92 : 0,
        }}
      />

      {/* 2. BACKSPLASH TILES WALL & ARCHITECTURAL GRID */}
      <div className="absolute top-0 inset-x-0 h-[210px] pointer-events-none z-0 opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="subway-tile" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 40 0 L 40 20 L 0 20 Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
              <path d="M 20 0 L 20 20" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#subway-tile)" />
        </svg>
      </div>

      {/* Modern ceramic floor tiles */}
      <div className="absolute bottom-0 left-0 right-0 h-[90px] bg-gradient-to-t from-[#090a10] via-[#10121b] to-[#161825] border-t border-white/[0.08] z-0">
        <svg className="w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
          <line x1="12%" y1="0" x2="5%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="28%" y1="0" x2="22%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="45%" y1="0" x2="42%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="62%" y1="0" x2="62%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="80%" y1="0" x2="82%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
      </div>

      {/* 3. UPPER WALL CABINETS & CUPBOARDS */}
      <div className="absolute top-0 left-3 right-3 sm:right-40 h-[92px] bg-[#181a26] border-b-2 border-white/10 shadow-xl z-10 flex">
        {/* Cabinet Door 1 */}
        <div className="w-1/4 h-full border-r border-white/10 relative p-2 flex flex-col justify-between bg-gradient-to-b from-[#212332] to-[#161722]">
          <span className="text-[8px] font-mono text-gray-500 uppercase">CABINET A</span>
          <div className="w-6 h-1 bg-slate-500 rounded-full" />
        </div>
        {/* Cabinet Door 2 */}
        <div className="w-1/4 h-full border-r border-white/10 relative p-2 flex flex-col justify-between bg-gradient-to-b from-[#212332] to-[#161722]">
          <span className="text-[8px] font-mono text-gray-500 uppercase">CABINET B</span>
          <div className="w-6 h-1 bg-slate-500 rounded-full" />
        </div>
        {/* Hood Chimney Alcove (Gap for exhaust chimney) */}
        <div className="w-1/4 h-full border-r border-white/10 relative bg-[#13141f] flex items-center justify-center">
          <div className="w-12 h-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 shadow-inner" />
        </div>
        {/* Cabinet Door 4 */}
        <div className="w-1/4 h-full relative p-2 flex flex-col justify-between bg-gradient-to-b from-[#212332] to-[#161722]">
          <span className="text-[8px] font-mono text-gray-500 uppercase">SPICE STORE</span>
          <div className="w-6 h-1 bg-slate-500 rounded-full" />
        </div>
      </div>

      {/* 4. UNDER-CABINET LIGHTING BAR */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Under-Cabinet Lights: ${counterLight.isOn ? 'ON' : 'OFF'}`}
        className="absolute top-[90px] left-3 right-3 sm:right-40 z-20 cursor-pointer group focus:outline-none"
        onClick={() => onToggleDevice(counterLight.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(counterLight.id);
          }
        }}
      >
        {/* LED Strip Fixture */}
        <div className={`w-full h-2 rounded-b border-b transition-all duration-300 ${
          counterLight.isOn 
            ? 'bg-amber-300 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)]' 
            : 'bg-gray-800 border-white/10 group-hover:bg-gray-700'
        }`} />

        {/* Downward Light Wash onto the Countertop */}
        {counterLight.isOn && (
          <div 
            className="absolute top-2 inset-x-0 h-28 pointer-events-none transition-all duration-500"
            style={{
              opacity: (counterLight.value ?? 80) / 100,
              background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.18) 55%, transparent 100%)',
            }}
          />
        )}

        {/* Status label */}
        <div className="absolute top-3 left-4">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/75 border border-white/10 text-gray-300 group-hover:border-amber-400/50">
            Counter Lights: {counterLight.isOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* 5. CEILING PENDANT / TRACK LIGHT */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Kitchen Ceiling Light: ${ceilingLight.isOn ? `${ceilingLight.value ?? 90}%` : 'OFF'}`}
        className="absolute top-0 left-[22%] -translate-x-1/2 z-25 flex flex-col items-center group cursor-pointer focus:outline-none"
        onClick={() => onToggleDevice(ceilingLight.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(ceilingLight.id);
          }
        }}
      >
        {/* Ceiling drop rod */}
        <div className="w-1 h-6 bg-slate-600 transition-colors group-hover:bg-amber-400" />
        
        {/* Lamp Shade */}
        <div className={`relative px-4 py-2 rounded-b-2xl border transition-all duration-300 group-hover:scale-105 ${
          ceilingLight.isOn 
            ? 'bg-[#3b2d18] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)]' 
            : 'bg-[#1e2029] border-white/10'
        }`}>
          <Lightbulb className={`w-4 h-4 transition-colors ${
            ceilingLight.isOn 
              ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]' 
              : 'text-gray-500'
          }`} />
        </div>

        {/* Downward Light Cone */}
        {ceilingLight.isOn && (
          <div 
            className="absolute top-10 -left-24 w-52 h-64 pointer-events-none transition-all duration-500"
            style={{
              opacity: (ceilingLight.value ?? 90) / 100,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 75%)',
              clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
            }}
          />
        )}

        {/* Status label */}
        <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/60 border border-white/10 text-gray-300 opacity-80 group-hover:opacity-100 group-hover:border-amber-400/50">
          Ceiling Light: {ceilingLight.isOn ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* 6. RANGE HOOD & EXHAUST FAN */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Kitchen Exhaust Fan: ${exhaustFan.isOn ? 'Active' : 'Off'}`}
        className="absolute top-[52px] left-[44%] sm:left-[45%] -translate-x-1/2 z-25 flex flex-col items-center group cursor-pointer focus:outline-none"
        onClick={() => onToggleDevice(exhaustFan.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(exhaustFan.id);
          }
        }}
      >
        {/* Stainless Steel Range Hood Canopy */}
        <div className={`w-28 sm:w-32 h-14 rounded-b-xl border transition-all duration-300 flex flex-col items-center justify-between p-1.5 shadow-2xl group-hover:border-sky-400 ${
          exhaustFan.isOn 
            ? 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-sky-400/60 shadow-[0_4px_20px_rgba(56,189,248,0.25)]' 
            : 'bg-gradient-to-b from-slate-800 to-slate-900 border-white/15'
        }`}>
          {/* Top chimney connector */}
          <div className="w-10 h-1 bg-slate-500 rounded-full" />

          {/* Grille and Spinning Exhaust Fan */}
          <div className="relative w-16 h-8 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
            {/* Spinning Turbine Blades */}
            <div 
              className={`w-7 h-7 transition-all ${exhaustFan.isOn ? 'animate-spin' : ''}`}
              style={{
                animationDuration: exhaustFan.isOn ? '0.5s' : '0s',
                animationTimingFunction: 'linear',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                <ellipse cx="50" cy="18" rx="7" ry="18" fill="#38bdf8" />
                <ellipse cx="50" cy="82" rx="7" ry="18" fill="#38bdf8" />
                <ellipse cx="18" cy="50" rx="18" ry="7" fill="#38bdf8" />
                <ellipse cx="82" cy="50" rx="18" ry="7" fill="#38bdf8" />
                <circle cx="50" cy="50" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>

            {/* Status LED */}
            <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
              exhaustFan.isOn ? 'bg-sky-400 animate-ping' : 'bg-gray-600'
            }`} />
          </div>

          {/* Air Filter Grille Bottom Line */}
          <div className="w-full h-1 bg-slate-600/60 rounded-full flex justify-around px-2">
            <div className="w-1 h-0.5 bg-black" />
            <div className="w-1 h-0.5 bg-black" />
            <div className="w-1 h-0.5 bg-black" />
          </div>
        </div>

        {/* Upward Air Extraction Steam Flow when ON */}
        {exhaustFan.isOn && (
          <div className="w-20 h-6 -mt-1 flex justify-around pointer-events-none opacity-70">
            <div className="w-1 bg-gradient-to-t from-sky-400 to-transparent rounded-full animate-pulse" style={{ height: '80%', animationDuration: '0.8s' }} />
            <div className="w-1.5 bg-gradient-to-t from-cyan-300 to-transparent rounded-full animate-pulse" style={{ height: '100%', animationDuration: '0.6s' }} />
            <div className="w-1 bg-gradient-to-t from-sky-400 to-transparent rounded-full animate-pulse" style={{ height: '80%', animationDuration: '0.9s' }} />
          </div>
        )}

        {/* Status label */}
        <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-sky-400/50">
          Exhaust Fan: {exhaustFan.isOn ? 'ACTIVE' : 'OFF'}
        </span>
      </div>

      {/* 7. COUNTERTOP WORKSTATION & LOWER CABINETS */}
      <div className="absolute bottom-0 left-3 right-3 sm:right-40 h-[175px] z-20 flex flex-col">
        {/* Quartz Countertop Surface Slab with Polish Reflection */}
        <div className="relative w-full h-7 bg-gradient-to-r from-[#2a2c3a] via-[#353849] to-[#252735] rounded-t-xl border-t-2 border-x-2 border-white/20 shadow-xl flex items-center px-4">
          <div className="w-full h-0.5 bg-white/25 rounded-full" />
        </div>

        {/* Lower Base Cabinets & Appliances Bay */}
        <div className="w-full flex-1 bg-[#171824] border-x border-b border-white/10 shadow-2xl flex">
          {/* Base Cabinet 1: Under-cooktop double drawers */}
          <div className="w-1/3 h-full border-r border-white/10 p-2 flex flex-col justify-around bg-gradient-to-b from-[#1b1c28] to-[#12131d]">
            <div className="w-full h-7 rounded border border-white/5 bg-[#141520] p-1 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="w-full h-10 rounded border border-white/5 bg-[#141520] p-1 flex items-center justify-center">
              <div className="w-16 h-1 bg-slate-500 rounded-full" />
            </div>
          </div>

          {/* Base Cabinet 2: Dishwasher / Sink cupboard */}
          <div className="w-1/3 h-full border-r border-white/10 p-2 flex flex-col justify-between bg-gradient-to-b from-[#1b1c28] to-[#12131d]">
            <div className="flex items-center justify-between text-[8px] font-mono text-gray-400">
              <span>DISHWASHER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="w-14 h-1 mx-auto bg-slate-500 rounded-full my-auto" />
            <div className="w-full h-1 bg-black/40 rounded-full" />
          </div>

          {/* Base Cabinet 3: Storage Drawer */}
          <div className="w-1/3 h-full p-2 flex flex-col justify-around bg-gradient-to-b from-[#1b1c28] to-[#12131d]">
            <div className="w-full h-8 rounded border border-white/5 bg-[#141520] p-1 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-500 rounded-full" />
            </div>
            <div className="w-full h-8 rounded border border-white/5 bg-[#141520] p-1 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 8. COUNTERTOP APPLIANCE: INDUCTION COOKTOP */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Induction Cooktop: ${cooktop.isOn ? 'Heating' : 'Off'}`}
        className="absolute bottom-[145px] left-[35%] sm:left-[36%] z-30 cursor-pointer group focus:outline-none"
        onClick={() => onToggleDevice(cooktop.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(cooktop.id);
          }
        }}
      >
        {/* Ceramic Glass Cooktop Housing */}
        <div className={`w-32 sm:w-36 h-14 rounded-lg border transition-all duration-300 p-1 flex items-center justify-around shadow-2xl ${
          cooktop.isOn 
            ? 'bg-[#2b1016] border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)]' 
            : 'bg-[#151620] border-white/20 group-hover:border-rose-400/50'
        }`}>
          {/* Burner Zone 1 (Left Ring) */}
          <div className="relative w-11 h-11 rounded-full flex items-center justify-center">
            {/* Glowing Induction Coil Rings */}
            <div className={`w-10 h-10 rounded-full border-2 transition-all ${
              cooktop.isOn 
                ? 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse' 
                : 'border-gray-600'
            }`} />
            <div className={`absolute w-6 h-6 rounded-full border transition-all ${
              cooktop.isOn 
                ? 'border-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' 
                : 'border-gray-700'
            }`} />
            <div className={`absolute w-2 h-2 rounded-full ${
              cooktop.isOn ? 'bg-orange-300 animate-ping' : 'bg-gray-800'
            }`} />
          </div>

          {/* Burner Zone 2 (Right Ring) */}
          <div className="relative w-9 h-9 rounded-full flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full border-2 transition-all ${
              cooktop.isOn 
                ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse' 
                : 'border-gray-600'
            }`} />
            <div className={`absolute w-4 h-4 rounded-full border transition-all ${
              cooktop.isOn 
                ? 'border-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.7)]' 
                : 'border-gray-700'
            }`} />
          </div>

          {/* Touch Control / Power Indicator */}
          <div className="flex flex-col items-center">
            <Flame className={`w-3.5 h-3.5 ${cooktop.isOn ? 'text-rose-400 animate-bounce' : 'text-gray-500'}`} />
            <span className={`text-[7px] font-mono ${cooktop.isOn ? 'text-rose-300 font-bold' : 'text-gray-500'}`}>
              {cooktop.isOn ? 'HOT' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Cooktop Status Label */}
        <div className="text-center mt-0.5">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-rose-400/50">
            Cooktop: {cooktop.isOn ? 'HEATING (DUAL ZONE)' : 'OFF'}
          </span>
        </div>
      </div>

      {/* 9. COUNTERTOP FIXTURE: KITCHEN SINK & GOOSENECK FAUCET */}
      <div className="absolute bottom-[145px] left-[63%] sm:left-[64%] z-25 pointer-events-none flex flex-col items-center">
        {/* Gooseneck Faucet Arch */}
        <div className="relative w-10 h-10 -mb-2">
          {/* Faucet stem and curve */}
          <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-md">
            <path 
              d="M 15 50 L 15 20 C 15 8, 38 8, 38 22 L 38 28" 
              fill="none" 
              stroke="#94a3b8" 
              strokeWidth="4" 
              strokeLinecap="round" 
            />
            {/* Aerator nozzle */}
            <rect x="35" y="28" width="6" height="3" fill="#cbd5e1" rx="1" />
            {/* Single lever handle */}
            <line x1="15" y1="35" x2="5" y2="30" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Undermount Stainless Sink Basin */}
        <div className="w-20 sm:w-24 h-8 rounded-lg bg-gradient-to-b from-[#181a24] to-[#252838] border-2 border-slate-600/60 shadow-inner flex items-center justify-center p-1">
          {/* Drain plug */}
          <div className="w-3 h-3 rounded-full bg-slate-400 border border-slate-700 shadow-sm flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-black" />
          </div>
        </div>
      </div>

      {/* 10. COUNTERTOP MICROWAVE */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Microwave: ${microwave.isOn ? 'Active' : 'Standby'}`}
        className="absolute bottom-[145px] left-6 z-30 cursor-pointer group focus:outline-none"
        onClick={() => onToggleDevice(microwave.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(microwave.id);
          }
        }}
      >
        <div className={`w-20 sm:w-24 h-14 rounded-lg border transition-all duration-300 p-1 flex items-center justify-between shadow-xl ${
          microwave.isOn 
            ? 'bg-[#211b33] border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
            : 'bg-[#151722] border-white/15 group-hover:border-purple-400/50'
        }`}>
          {/* Door Glass Window with Turntable */}
          <div className={`w-12 sm:w-15 h-full rounded border flex items-center justify-center relative overflow-hidden ${
            microwave.isOn 
              ? 'bg-amber-950/70 border-amber-400/50 shadow-inner' 
              : 'bg-black/60 border-white/10'
          }`}>
            <MicroIcon className={`w-4 h-4 ${microwave.isOn ? 'text-amber-300 animate-pulse' : 'text-gray-600'}`} />
            {microwave.isOn && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-400/80 animate-pulse" />
            )}
          </div>

          {/* Keypad Panel & Digital Clock */}
          <div className="flex-1 flex flex-col justify-between items-center pl-1 h-full">
            <span className="text-[7px] font-mono text-cyan-300 bg-black/60 rounded px-0.5">
              {microwave.isOn ? '01:30' : '12:00'}
            </span>
            <div className="grid grid-cols-2 gap-0.5 w-full">
              <div className="h-1 bg-gray-600 rounded-sm" />
              <div className="h-1 bg-gray-600 rounded-sm" />
              <div className="h-1 bg-gray-600 rounded-sm" />
              <div className="h-1 bg-gray-600 rounded-sm" />
            </div>
            <div className={`w-2 h-2 rounded-full ${microwave.isOn ? 'bg-emerald-400' : 'bg-gray-700'}`} />
          </div>
        </div>

        {/* Microwave status label */}
        <div className="text-center mt-0.5">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/60 border border-white/10 text-gray-300 group-hover:border-purple-400/50">
            Microwave: {microwave.isOn ? 'HEATING' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* 11. SMART REFRIGERATOR (RIGHT FULL-HEIGHT APPLIANCE) */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Smart Refrigerator: ${fridge.isOn ? 'Active (Eco Mode)' : 'Standby'}`}
        className="absolute top-4 right-3 sm:right-6 bottom-4 w-28 sm:w-32 z-30 cursor-pointer group focus:outline-none"
        onClick={() => onToggleDevice(fridge.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDevice(fridge.id);
          }
        }}
      >
        {/* Refrigerator Chassis Body */}
        <div className={`w-full h-full rounded-2xl border-2 transition-all duration-300 p-1.5 flex flex-col justify-between shadow-2xl ${
          fridge.isOn 
            ? 'bg-gradient-to-b from-[#16222f] via-[#121a24] to-[#0c1219] border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.3)]' 
            : 'bg-gradient-to-b from-[#181922] to-[#101117] border-white/15 group-hover:border-cyan-400/40'
        }`}>
          {/* Upper French Door / Top Compartment */}
          <div className="w-full h-[58%] rounded-xl bg-gradient-to-b from-[#1e2736] to-[#161c28] border border-white/10 p-2 flex flex-col justify-between relative shadow-inner">
            {/* Brand Logo & Smart Screen */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <FridgeIcon className={`w-3.5 h-3.5 ${fridge.isOn ? 'text-cyan-300' : 'text-gray-500'}`} />
                <span className="text-[8px] font-mono font-semibold text-gray-300 tracking-wider">SMART FRIDGE</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${
                fridge.isOn ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse' : 'bg-gray-600'
              }`} />
            </div>

            {/* Smart Digital Touch Screen Readout */}
            <div className={`p-1.5 rounded-lg border text-center transition-all ${
              fridge.isOn 
                ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                : 'bg-black/40 border-white/5 text-gray-600'
            }`}>
              <div className="text-[10px] font-mono font-bold">
                {fridge.isOn ? '3°C | -18°C' : '--°C | --°C'}
              </div>
              <div className="text-[7px] font-mono tracking-widest text-cyan-400 uppercase mt-0.5">
                {fridge.isOn ? 'ECO COOLING' : 'STANDBY'}
              </div>
            </div>

            {/* Water / Ice Dispenser Alcove */}
            <div className="w-12 h-7 mx-auto rounded bg-black/50 border border-white/10 flex flex-col items-center justify-center">
              <div className="w-4 h-1 bg-cyan-400/50 rounded-full mb-0.5" />
              <div className="w-2 h-2 rounded-full bg-slate-500" />
            </div>

            {/* French door split vertical seam */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-black/40 pointer-events-none" />
          </div>

          {/* Door Gap Seam */}
          <div className="w-full h-1 bg-black/60 rounded" />

          {/* Lower Freezer Pullout Drawer */}
          <div className="w-full h-[38%] rounded-xl bg-gradient-to-b from-[#1a2330] to-[#121721] border border-white/10 p-2 flex flex-col justify-between shadow-inner">
            <span className="text-[7px] font-mono text-gray-500 uppercase">FREEZER SECTION</span>
            {/* Horizontal Freezer Handle */}
            <div className="w-16 h-1.5 mx-auto bg-slate-500 rounded-full shadow" />
            <div className="text-[7px] font-mono text-center text-gray-400">
              {fridge.isOn ? 'SUPER FROST' : 'IDLE'}
            </div>
          </div>
        </div>

        {/* Status label below fridge */}
        <div className="text-center mt-1">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/70 border border-white/15 text-gray-300 group-hover:border-cyan-400/50">
            Fridge: {fridge.isOn ? 'ECO (3°C)' : 'STANDBY'}
          </span>
        </div>
      </div>
    </div>
  );
};
