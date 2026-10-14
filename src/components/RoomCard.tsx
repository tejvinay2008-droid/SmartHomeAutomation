import React from 'react';
import { 
  Wifi, 
  Monitor, 
  Thermometer, 
  Lock, 
  Unlock, 
  Droplets, 
  UtensilsCrossed, 
  Microwave,
  Plus,
  Minus
} from 'lucide-react';
import type { Room } from '../types';

interface RoomCardProps {
  room: Room;
  isActive: boolean;
  onToggleActive: (roomId: string) => void;
  onTempChange?: (roomId: string, delta: number) => void;
  onToggleLock?: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isActive,
  onToggleActive,
  onTempChange,
  onToggleLock,
}) => {
  const getDotClass = () => {
    switch (room.dotColor) {
      case 'green':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      case 'orange':
      case 'amber':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
      case 'red':
        return 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
      case 'blue':
        return 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]';
      default:
        return 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]';
    }
  };

  return (
    <div
      className={`relative p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between h-[155px] ${
        isActive
          ? 'bg-[#1a1b23] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
          : 'bg-[#14151b] border border-white/[0.03] opacity-80 hover:opacity-95'
      }`}
    >
      {/* Top Header: Title & Status Dot */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-[16px] font-medium text-white/95 tracking-tight">
            {room.name}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {room.status}
          </p>
        </div>

        {/* Status Dot */}
        <span className={`w-2 h-2 rounded-full mt-1.5 ${getDotClass()}`} />
      </div>

      {/* Middle/Bottom Area: Badges & Controls */}
      <div className="flex items-center justify-between mt-auto">
        {/* Left Side Icons/Badges */}
        <div className="flex items-center gap-1.5">
          {room.id === 'office' && (
            <div className="flex items-center gap-1">
              <span className="w-7 h-7 rounded-full bg-[#1b253b] text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Wifi className="w-3.5 h-3.5" />
              </span>
              <span className="w-7 h-7 rounded-full bg-[#2a1e38] text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Monitor className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {room.id === 'bedroom' && (
            <div className="flex items-center gap-1.5 bg-[#1b2535] px-2.5 py-1 rounded-full border border-sky-500/20 text-xs text-sky-300">
              <Thermometer className="w-3.5 h-3.5" />
              <span className="font-semibold">{room.temperature || 20.5}°C</span>
              {onTempChange && (
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTempChange(room.id, -0.5);
                    }}
                    className="p-0.5 hover:bg-white/10 rounded"
                    aria-label="Lower temperature"
                  >
                    <Minus className="w-3 h-3 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTempChange(room.id, 0.5);
                    }}
                    className="p-0.5 hover:bg-white/10 rounded"
                    aria-label="Raise temperature"
                  >
                    <Plus className="w-3 h-3 text-gray-400 hover:text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {room.id === 'entryway' && (
            <div className="w-8 h-8 rounded-full bg-[#361a22] text-rose-400 flex items-center justify-center border border-rose-500/20">
              {room.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            </div>
          )}

          {room.id === 'kitchen' && (
            <div className="flex items-center gap-1">
              <span className="w-7 h-7 rounded-full bg-[#2e2338] text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Microwave className="w-3.5 h-3.5" />
              </span>
              <span className="w-7 h-7 rounded-full bg-[#262438] text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <UtensilsCrossed className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {room.id === 'garden' && (
            <div className="w-8 h-8 rounded-full bg-[#182638] text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Droplets className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Right Side Control */}
        {room.id === 'entryway' ? (
          <div className="flex flex-col items-end">
            <button
              onClick={() => onToggleLock?.(room.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-md ${
                room.isLocked
                  ? 'bg-[#5b3294] text-purple-100 hover:bg-[#6e3cb2] shadow-[0_0_15px_rgba(107,33,168,0.4)]'
                  : 'bg-[#1d322b] text-emerald-300 border border-emerald-500/30 hover:bg-[#254238]'
              }`}
            >
              {room.isLocked ? 'Unlock' : 'Lock'}
            </button>
            <span className="text-[9px] text-gray-500 mt-0.5">Password Secured</span>
          </div>
        ) : (
          <button
            onClick={() => onToggleActive(room.id)}
            aria-label={`Toggle active state for ${room.name}`}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              isActive ? 'bg-[#7c3aed]' : 'bg-[#2b2d39]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
