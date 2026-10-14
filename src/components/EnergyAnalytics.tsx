import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { Zap, Activity, Cpu, CheckCircle } from 'lucide-react';
import { HOURLY_ENERGY_DATA } from '../services/mockData';
import type { SystemStats } from '../types';

interface EnergyAnalyticsProps {
  stats: SystemStats;
}

export const EnergyAnalytics: React.FC<EnergyAnalyticsProps> = ({ stats }) => {
  return (
    <div className="bg-[#14151c] border border-white/[0.08] rounded-3xl p-6 mt-6">
      {/* Top Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-white/[0.05]">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Total Appliances</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-white tracking-tight">{stats.totalDevices}</p>
          <span className="text-[10px] text-gray-500">Connected to Hub</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Active Devices</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-semibold text-emerald-400 tracking-tight">{stats.activeDevices}</p>
          <span className="text-[10px] text-gray-500">Currently Drawing Power</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Voice Commands</span>
            <Activity className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-semibold text-white tracking-tight">{stats.processedCommands}</p>
          <span className="text-[10px] text-gray-500">Processed & Parsed</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Current Load</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-semibold text-amber-300 tracking-tight">{stats.currentPowerWatts} <span className="text-xs font-normal text-gray-400">W</span></p>
          <span className="text-[10px] text-amber-400/80 font-mono">Estimated Load</span>
        </div>
      </div>

      {/* Energy Consumption Trend Chart */}
      <div className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Simulated Energy Demand (Hourly Estimate)</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Academic Telemetry
              </span>
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Power consumption modeled in real-time based on active loads and heating/cooling state.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Est. Daily Usage: </span>
            <span className="text-xs font-bold text-gray-200">14.8 kWh</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_ENERGY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#6b7280" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                unit="W" 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1b1c26',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: any) => [`${value} W (Estimated)`, 'Power Consumption']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="watts" 
                stroke="#ec4899" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#energyGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
