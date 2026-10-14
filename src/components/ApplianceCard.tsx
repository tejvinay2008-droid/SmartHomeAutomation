import React from 'react';
import { 
  Lightbulb, 
  Lamp, 
  Fan, 
  Blinds, 
  Tv, 
  AirVent, 
  Power,
  Flame,
  Refrigerator,
  Microwave
} from 'lucide-react';
import type { Device } from '../types';

interface ApplianceCardProps {
  device: Device;
  onToggle: (id: string) => void;
  onValueChange?: (id: string, value: number) => void;
}

export const ApplianceCard: React.FC<ApplianceCardProps> = ({
  device,
  onToggle,
  onValueChange,
}) => {
  const getIcon = () => {
    switch (device.type) {
      case 'light':
        return device.id.includes('lamp') ? (
          <Lamp className="w-5 h-5 text-amber-300" />
        ) : (
          <Lightbulb className="w-5 h-5 text-amber-300" />
        );
      case 'fan':
        return <Fan className={`w-5 h-5 text-sky-300 ${device.isOn ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />;
      case 'shades':
        return <Blinds className="w-5 h-5 text-indigo-300" />;
      case 'tv':
        return <Tv className="w-5 h-5 text-purple-300" />;
      case 'ac':
        return <AirVent className="w-5 h-5 text-teal-300" />;
      case 'cooktop':
        return <Flame className={`w-5 h-5 ${device.isOn ? 'text-rose-400 animate-pulse' : 'text-gray-400'}`} />;
      case 'refrigerator':
        return <Refrigerator className="w-5 h-5 text-cyan-300" />;
      case 'microwave':
        return <Microwave className="w-5 h-5 text-amber-300" />;
      default:
        return <Power className="w-5 h-5 text-gray-300" />;
    }
  };

  const getBadgeBg = () => {
    switch (device.type) {
      case 'light':
        return 'bg-[#3d2a1d] text-amber-400 border border-amber-500/20';
      case 'fan':
        return 'bg-[#1b2b3a] text-sky-400 border border-sky-500/20';
      case 'shades':
        return 'bg-[#22243d] text-indigo-400 border border-indigo-500/20';
      case 'tv':
        return 'bg-[#2a1e38] text-purple-400 border border-purple-500/20';
      case 'cooktop':
        return 'bg-[#3b181e] text-rose-400 border border-rose-500/20';
      case 'refrigerator':
        return 'bg-[#152e3b] text-cyan-400 border border-cyan-500/20';
      case 'microwave':
        return 'bg-[#2a1e38] text-amber-400 border border-amber-500/20';
      default:
        return 'bg-[#20222c] text-gray-400 border border-white/10';
    }
  };

  return (
    <div
      className={`relative p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between h-[155px] ${
        device.isOn
          ? 'bg-[#1a1b23] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
          : 'bg-[#14151b] border border-white/[0.03] opacity-75 hover:opacity-90'
      }`}
    >
      {/* Top Header inside card: Icon badge and Status Dot */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggle(device.id)}
          aria-label={`Toggle ${device.name}`}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${getBadgeBg()}`}
        >
          {getIcon()}
        </button>

        {/* Top right status indicator */}
        {device.type === 'shades' ? (
          <span className="text-xs font-medium text-gray-400">
            {device.isOn ? 'Open' : 'Closed'}
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                device.isOn ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-gray-600'
              }`}
            />
          </div>
        )}
      </div>

      {/* Center Title */}
      <div className="my-auto">
        <h4 className="text-[15px] font-medium text-white/95 tracking-tight truncate">
          {device.name}
        </h4>
      </div>

      {/* Bottom control element: Slider, Action button, or Quick Switch */}
      {device.canSlide && device.value !== undefined ? (
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="font-semibold text-gray-300">{device.value}%</span>
          </div>
          <div className="relative h-6 w-full bg-[#232530] rounded-full overflow-hidden p-0.5 flex items-center">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                device.isOn
                  ? 'bg-gradient-to-r from-[#b45309] to-[#d97706]'
                  : 'bg-gray-700 opacity-40'
              }`}
              style={{ width: `${device.isOn ? device.value : 0}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={device.isOn ? device.value : 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!device.isOn && val > 0) onToggle(device.id);
                onValueChange?.(device.id, val);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label={`Adjust ${device.name} brightness`}
            />
          </div>
        </div>
      ) : device.type === 'shades' ? (
        <div className="flex items-center justify-end">
          <button
            onClick={() => onToggle(device.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 ${
              device.isOn
                ? 'bg-[#2b2540] text-purple-200 border border-purple-500/40 hover:bg-[#342c50]'
                : 'bg-[#5b3294] text-purple-100 hover:bg-[#6c3cb2] shadow-[0_0_15px_rgba(107,33,168,0.4)]'
            }`}
          >
            {device.isOn ? 'Close' : 'Open'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {device.isOn ? device.statusText || 'Running' : 'Turned off'}
          </span>
          <button
            onClick={() => onToggle(device.id)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              device.isOn ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                device.isOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};
